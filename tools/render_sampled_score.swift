import AVFoundation
import Foundation

// Legacy macOS sampler kept for reference. Use generate_bgm.py for the current six-track soundtrack.

struct Note { let track: Int; let beat: Double; let length: Double; let pitch: UInt8; let velocity: UInt8 }
struct Part { let program: UInt8; let bank: UInt8; let gain: Float }
struct Song { let name: String; let bpm: Double; let bars: Int; let parts: [Part]; let notes: [Note] }

let dls = URL(fileURLWithPath: "/System/Library/Components/CoreAudio.component/Contents/Resources/gs_instruments.dls")
let output = URL(fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "assets/audio")
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)

func chord(_ notes: inout [Note], _ track: Int, _ beat: Double, _ pitches: [UInt8], _ length: Double, _ velocity: UInt8) {
  for pitch in pitches { notes.append(Note(track: track, beat: beat, length: length, pitch: pitch, velocity: velocity)) }
}

func makeSong(name: String, bpm: Double, bars: Int, progression: [[UInt8]], melody: [UInt8], tense: Bool = false, boss: Bool = false) -> Song {
  var notes: [Note] = []
  for bar in 0..<bars {
    let b = Double(bar * 4)
    let c = progression[bar % progression.count]
    chord(&notes, 0, b, c, 3.85, tense ? 52 : 60)
    notes.append(Note(track: 1, beat: b, length: 1.8, pitch: c[0] - 12, velocity: boss ? 105 : 78))
    notes.append(Note(track: 1, beat: b + 2, length: 1.8, pitch: c[0] - 12, velocity: boss ? 98 : 72))
    for step in 0..<8 {
      let p = c[step % c.count] + 12
      notes.append(Note(track: 2, beat: b + Double(step) * 0.5, length: 0.38, pitch: p, velocity: tense ? 48 : 60))
    }
    if bar % 2 == (tense ? 1 : 0) {
      for step in 0..<4 {
        notes.append(Note(track: 3, beat: b + Double(step), length: 0.78, pitch: melody[(bar * 2 + step) % melody.count], velocity: boss ? 102 : 76))
      }
    }
    let kick: UInt8 = 36
    let snare: UInt8 = 38
    notes.append(Note(track: 4, beat: b, length: 0.12, pitch: kick, velocity: boss ? 116 : 76))
    notes.append(Note(track: 4, beat: b + 2, length: 0.12, pitch: boss ? kick : snare, velocity: boss ? 108 : 58))
    if tense || boss {
      for q in [1.0, 3.0] { notes.append(Note(track: 4, beat: b + q, length: 0.08, pitch: 42, velocity: boss ? 75 : 44)) }
    }
  }
  let parts = [
    Part(program: tense ? 48 : 46, bank: 121, gain: 0.55),
    Part(program: boss ? 38 : 42, bank: 121, gain: 0.72),
    Part(program: tense ? 10 : 24, bank: 121, gain: 0.58),
    Part(program: tense ? 68 : 73, bank: 121, gain: 0.64),
    Part(program: 0, bank: 120, gain: 0.66),
  ]
  return Song(name: name, bpm: bpm, bars: bars, parts: parts, notes: notes)
}

let songs = [
  makeSong(name: "town-bgm", bpm: 82, bars: 16,
           progression: [[57,60,64,67],[55,59,62,67],[53,57,60,64],[55,59,62,67]],
           melody: [69,72,71,67,69,64,67,66,64,67,69,72,71,67,64,66]),
  makeSong(name: "dungeon-bgm", bpm: 66, bars: 16,
           progression: [[50,53,57,60],[49,52,56,59],[46,50,53,58],[48,51,55,60]],
           melody: [62,63,59,58,62,55,56,51], tense: true),
  makeSong(name: "battle-bgm", bpm: 126, bars: 16,
           progression: [[45,52,57,60],[43,50,55,58],[41,48,53,57],[44,51,56,59]],
           melody: [69,72,76,75,72,69,67,68], tense: true),
  makeSong(name: "boss-bgm", bpm: 144, bars: 16,
           progression: [[41,48,53,56],[40,47,52,55],[38,45,50,53],[40,47,52,56]],
           melody: [65,68,72,71,68,65,63,64], tense: true, boss: true),
]

func render(_ song: Song) throws {
  let engine = AVAudioEngine()
  let format = AVAudioFormat(standardFormatWithSampleRate: 48_000, channels: 2)!
  var samplers: [AVAudioUnitSampler] = []
  for part in song.parts {
    let sampler = AVAudioUnitSampler()
    engine.attach(sampler)
    engine.connect(sampler, to: engine.mainMixerNode, format: format)
    try sampler.loadSoundBankInstrument(at: dls, program: part.program, bankMSB: part.bank, bankLSB: 0)
    sampler.volume = part.gain
    samplers.append(sampler)
  }
  try engine.enableManualRenderingMode(.offline, format: format, maximumFrameCount: 4096)
  try engine.start()
  let secondsPerBeat = 60.0 / song.bpm
  let totalSeconds = Double(song.bars * 4) * secondsPerBeat
  for note in song.notes {
    let start = AUEventSampleTime(note.beat * secondsPerBeat * format.sampleRate)
    let end = AUEventSampleTime((note.beat + note.length) * secondsPerBeat * format.sampleRate)
    let on: [UInt8] = [0x90, note.pitch, note.velocity]
    let off: [UInt8] = [0x80, note.pitch, 0]
    on.withUnsafeBufferPointer { samplers[note.track].auAudioUnit.scheduleMIDIEventBlock?(start, 0, 3, $0.baseAddress!) }
    off.withUnsafeBufferPointer { samplers[note.track].auAudioUnit.scheduleMIDIEventBlock?(end, 0, 3, $0.baseAddress!) }
  }
  let url = output.appendingPathComponent(song.name + ".wav")
  let file = try AVAudioFile(forWriting: url, settings: format.settings)
  let buffer = AVAudioPCMBuffer(pcmFormat: engine.manualRenderingFormat, frameCapacity: 4096)!
  let totalFrames = AVAudioFramePosition(totalSeconds * format.sampleRate)
  while engine.manualRenderingSampleTime < totalFrames {
    let remaining = totalFrames - engine.manualRenderingSampleTime
    let frames = AVAudioFrameCount(min(Int64(buffer.frameCapacity), remaining))
    let status = try engine.renderOffline(frames, to: buffer)
    if status == .success { try file.write(from: buffer) }
  }
  engine.stop()
  print("Rendered \(url.lastPathComponent) (\(String(format: "%.1f", totalSeconds))s)")
}

for song in songs { try render(song) }
