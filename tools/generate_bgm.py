"""Render the looping game scores without external samples.

The renderer deliberately stays dependency-free so every source tone can be
recreated from the repository.  Each cue has its own orchestration and a clear
four-part arc; the shared mastering stage keeps loudness and stereo width
consistent without flattening those dynamics.
"""

from __future__ import annotations

import argparse
import math
import random
import struct
import wave
from array import array
from pathlib import Path


RATE = 48_000
TAU = math.tau
ROOT = Path(__file__).resolve().parents[1] / "assets" / "audio"


def hz(midi: float) -> float:
    return 440.0 * (2.0 ** ((midi - 69.0) / 12.0))


def _smoothstep(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3.0 - 2.0 * value)


def envelope(t: float, duration: float, attack: float, release: float) -> float:
    """A click-free envelope with a very small natural decay."""
    rise = _smoothstep(t / max(attack, 0.001))
    fall = _smoothstep((duration - t) / max(release, 0.001))
    return max(0.0, min(rise, fall))


def _voice_sample(voice: str, phase: float, t: float, duration: float, phase2: float) -> float:
    """Band-conscious additive voices used by the arrangements."""
    if voice == "nylon":
        decay = math.exp(-3.6 * t / max(duration, 0.12))
        return decay * (math.sin(phase) + 0.36 * math.sin(2 * phase + phase2) + 0.13 * math.sin(3 * phase)) / 1.34
    if voice == "mallet":
        decay = math.exp(-5.0 * t / max(duration, 0.1))
        return decay * (math.sin(phase) + 0.35 * math.sin(2.01 * phase) + 0.22 * math.sin(3.97 * phase + phase2)) / 1.32
    if voice == "crystal":
        decay = math.exp(-4.0 * t / max(duration, 0.12))
        return decay * (math.sin(phase) + 0.26 * math.sin(2.66 * phase + phase2) + 0.18 * math.sin(4.08 * phase)) / 1.25
    if voice == "flute":
        return (math.sin(phase) + 0.19 * math.sin(2 * phase + phase2) + 0.055 * math.sin(3 * phase)) / 1.12
    if voice == "oboe":
        return (math.sin(phase) + 0.42 * math.sin(2 * phase) + 0.19 * math.sin(3 * phase + phase2) + 0.08 * math.sin(4 * phase)) / 1.48
    if voice == "strings":
        chorus = math.sin(phase * 1.0031 + phase2)
        return (math.sin(phase) + 0.42 * chorus + 0.24 * math.sin(2 * phase) + 0.13 * math.sin(3 * phase + phase2)) / 1.62
    if voice == "choir":
        formant = 0.23 * math.sin(2 * phase + 0.7) + 0.16 * math.sin(3 * phase + phase2)
        return (math.sin(phase) + 0.48 * math.sin(phase * 1.0022 + phase2) + formant) / 1.55
    if voice == "brass":
        return (math.sin(phase) + 0.52 * math.sin(2 * phase) + 0.31 * math.sin(3 * phase) + 0.17 * math.sin(4 * phase + phase2)) / 1.62
    if voice == "saw":
        return (math.sin(phase) + 0.50 * math.sin(2 * phase) + 0.33 * math.sin(3 * phase) + 0.23 * math.sin(4 * phase) + 0.14 * math.sin(5 * phase)) / 1.82
    if voice == "organ":
        return (math.sin(phase) + 0.54 * math.sin(2 * phase) + 0.19 * math.sin(4 * phase + phase2)) / 1.45
    if voice == "pulse":
        return (math.sin(phase) + 0.38 * math.sin(3 * phase) + 0.20 * math.sin(5 * phase)) / 1.36
    if voice == "bass":
        return (math.sin(phase) + 0.30 * math.sin(2 * phase + phase2) + 0.11 * math.sin(3 * phase)) / 1.28
    if voice == "dark":
        return (math.sin(phase) + 0.28 * math.sin(0.5 * phase + phase2) + 0.11 * math.sin(3 * phase)) / 1.30
    return math.sin(phase)


def add_note(
    left: array,
    right: array,
    start: float,
    duration: float,
    midi: float,
    gain: float,
    pan: float = 0.0,
    voice: str = "strings",
    attack: float = 0.02,
    release: float = 0.18,
    vibrato: float = 0.0,
    bend: float = 0.0,
) -> None:
    begin = max(0, int(start * RATE))
    end = min(len(left), int((start + duration) * RATE))
    if begin >= end:
        return
    frequency = hz(midi)
    pan = max(-0.98, min(0.98, pan))
    lg = gain * math.sqrt((1.0 - pan) * 0.5)
    rg = gain * math.sqrt((1.0 + pan) * 0.5)
    phase2 = random.random() * TAU
    tremolo_phase = random.random() * TAU
    for index in range(begin, end):
        t = (index - begin) / RATE
        env = envelope(t, duration, attack, release)
        phase = TAU * frequency * t
        if vibrato:
            phase += vibrato * math.sin(TAU * 5.15 * t + phase2)
        if bend:
            phase += TAU * frequency * bend * t * t / max(duration, 0.01)
        tone = _voice_sample(voice, phase, t, duration, phase2)
        # Tiny uncorrelated ensemble motion makes sustained notes occupy space
        # without moving their perceived position.
        motion = 1.0 + 0.025 * math.sin(TAU * 0.31 * t + tremolo_phase)
        value = tone * env
        left[index] += value * lg * motion
        right[index] += value * rg * (2.0 - motion)


def add_chord(
    left: array,
    right: array,
    start: float,
    duration: float,
    notes: list[int],
    gain: float,
    voice: str,
    attack: float,
    release: float,
    spread: float = 0.64,
) -> None:
    count = max(1, len(notes) - 1)
    for index, note in enumerate(notes):
        pan = -spread + 2.0 * spread * index / count
        add_note(left, right, start, duration, note, gain, pan, voice, attack, release, 0.018 if voice in {"strings", "choir"} else 0.0)


def add_drum(left: array, right: array, start: float, gain: float, kind: str, pan: float = 0.0) -> None:
    durations = {
        "kick": 0.42,
        "snare": 0.30,
        "hat": 0.075,
        "openhat": 0.30,
        "tom": 0.48,
        "cymbal": 1.25,
        "shaker": 0.12,
        "boom": 1.05,
    }
    duration = durations[kind]
    begin = max(0, int(start * RATE))
    end = min(len(left), int((start + duration) * RATE))
    pan = max(-0.95, min(0.95, pan))
    lg = gain * math.sqrt((1.0 - pan) * 0.5)
    rg = gain * math.sqrt((1.0 + pan) * 0.5)
    previous_noise = 0.0
    metal_phase = random.random() * TAU
    for index in range(begin, end):
        t = (index - begin) / RATE
        noise = random.random() * 2.0 - 1.0
        high_noise = noise - previous_noise * 0.86
        previous_noise = noise
        if kind == "kick":
            phase = TAU * (72.0 * t - 32.0 * t * t)
            sample = math.sin(phase) * math.exp(-8.0 * t) + 0.20 * noise * math.exp(-38.0 * t)
        elif kind == "snare":
            sample = 0.78 * high_noise * math.exp(-13.0 * t) + 0.30 * math.sin(TAU * 178 * t) * math.exp(-18.0 * t)
        elif kind == "hat":
            sample = high_noise * math.exp(-45.0 * t) + 0.12 * math.sin(TAU * 6100 * t + metal_phase) * math.exp(-38.0 * t)
        elif kind == "openhat":
            sample = high_noise * math.exp(-13.0 * t) + 0.10 * math.sin(TAU * 7300 * t + metal_phase) * math.exp(-11.0 * t)
        elif kind == "tom":
            phase = TAU * (118.0 * t - 25.0 * t * t)
            sample = math.sin(phase) * math.exp(-7.0 * t) + 0.10 * noise * math.exp(-25.0 * t)
        elif kind == "cymbal":
            metallic = math.sin(TAU * 2700 * t) + 0.6 * math.sin(TAU * 3917 * t + metal_phase)
            sample = (0.62 * high_noise + 0.20 * metallic) * math.exp(-3.7 * t)
        elif kind == "shaker":
            pulse = min(1.0, t * 100.0) * math.exp(-28.0 * t)
            sample = high_noise * pulse
        else:  # boom
            phase = TAU * (52.0 * t - 9.0 * t * t)
            sample = math.sin(phase) * math.exp(-3.8 * t) + 0.18 * noise * math.exp(-12.0 * t)
        left[index] += sample * lg
        right[index] += sample * rg


def add_whoosh(left: array, right: array, start: float, duration: float, gain: float, pan_from: float = -0.7, pan_to: float = 0.7) -> None:
    begin = max(0, int(start * RATE))
    end = min(len(left), int((start + duration) * RATE))
    previous = 0.0
    for index in range(begin, end):
        t = (index - begin) / RATE
        ratio = t / max(duration, 0.001)
        noise = random.random() * 2.0 - 1.0
        high = noise - previous * (0.93 - 0.35 * ratio)
        previous = noise
        env = math.sin(math.pi * ratio) ** 2
        pan = pan_from + (pan_to - pan_from) * ratio
        lg = math.sqrt((1.0 - pan) * 0.5)
        rg = math.sqrt((1.0 + pan) * 0.5)
        left[index] += high * env * gain * lg
        right[index] += high * env * gain * rg


def canvas(bpm: float, bars: int) -> tuple[float, array, array]:
    beat = 60.0 / bpm
    size = int(bars * 4 * beat * RATE)
    return beat, array("f", [0.0]) * size, array("f", [0.0]) * size


def _master(left: array, right: array, target_rms: float, room: float, width: float) -> tuple[float, float]:
    """Stereo room, gentle bus compression, then conservative normalization."""
    delays = ((0.071, room * 0.42), (0.113, room * 0.27), (0.173, room * 0.18))
    for seconds, gain in delays:
        delay = int(seconds * RATE)
        for index in range(delay, len(left)):
            dry_l = left[index]
            dry_r = right[index]
            left[index] = dry_l + right[index - delay] * gain
            right[index] = dry_r + left[index - delay] * gain * 0.94

    # Widen only the difference channel, keeping bass and lead information in
    # the stable centre.  This remains fully mono-compatible.
    for index in range(len(left)):
        middle = (left[index] + right[index]) * 0.5
        side = (left[index] - right[index]) * 0.5 * width
        left[index] = middle + side
        right[index] = middle - side

    # A quiet, eight-millisecond edge fade avoids clicks in browser looping.
    edge = min(int(0.008 * RATE), len(left) // 4)
    for index in range(edge):
        ratio = _smoothstep(index / max(1, edge - 1))
        left[index] *= ratio
        right[index] *= ratio
        left[-1 - index] *= ratio
        right[-1 - index] *= ratio

    peak = 0.001
    energy = 0.0
    for l_sample, r_sample in zip(left, right):
        peak = max(peak, abs(l_sample), abs(r_sample))
        energy += l_sample * l_sample + r_sample * r_sample
    rms = math.sqrt(energy / max(1, len(left) * 2))
    scale = min(0.94 / peak, target_rms / max(rms, 0.001))

    final_peak = 0.0
    final_energy = 0.0
    for index in range(len(left)):
        l_sample = left[index] * scale
        r_sample = right[index] * scale
        # Rounded knee only catches stacked transients; musical dynamics remain.
        if abs(l_sample) > 0.82:
            l_sample = math.copysign(0.82 + (abs(l_sample) - 0.82) * 0.32, l_sample)
        if abs(r_sample) > 0.82:
            r_sample = math.copysign(0.82 + (abs(r_sample) - 0.82) * 0.32, r_sample)
        left[index] = max(-0.96, min(0.96, l_sample))
        right[index] = max(-0.96, min(0.96, r_sample))
        final_peak = max(final_peak, abs(left[index]), abs(right[index]))
        final_energy += left[index] ** 2 + right[index] ** 2
    return final_peak, math.sqrt(final_energy / max(1, len(left) * 2))


def finish(
    name: str,
    left: array,
    right: array,
    target_rms: float,
    room: float,
    width: float = 1.42,
    density_makeup: bool = False,
) -> None:
    peak, rms = _master(left, right, target_rms, room, width)
    # Dense threat arrangements can hit the conservative peak ceiling before
    # their body reaches the requested RMS.  A second, very soft makeup pass
    # raises that body while rounding only the isolated tallest transients.
    # Core music leaves this disabled and therefore remains bit-for-bit on its
    # original mastering path.
    if density_makeup and rms < target_rms * 0.995:
        makeup = target_rms / max(rms, 0.001)
        peak = 0.0
        energy = 0.0
        for index in range(len(left)):
            l_sample = left[index] * makeup
            r_sample = right[index] * makeup
            if abs(l_sample) > 0.84:
                l_sample = math.copysign(0.84 + (abs(l_sample) - 0.84) * 0.28, l_sample)
            if abs(r_sample) > 0.84:
                r_sample = math.copysign(0.84 + (abs(r_sample) - 0.84) * 0.28, r_sample)
            left[index] = max(-0.94, min(0.94, l_sample))
            right[index] = max(-0.94, min(0.94, r_sample))
            peak = max(peak, abs(left[index]), abs(right[index]))
            energy += left[index] ** 2 + right[index] ** 2
        rms = math.sqrt(energy / max(1, len(left) * 2))
    path = ROOT / name
    with wave.open(str(path), "wb") as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(RATE)
        chunk = 8192
        for offset in range(0, len(left), chunk):
            frames = bytearray()
            for l_sample, r_sample in zip(left[offset : offset + chunk], right[offset : offset + chunk]):
                frames += struct.pack("<hh", int(l_sample * 32767), int(r_sample * 32767))
            output.writeframes(frames)
    print(f"rendered {name:16} {len(left) / RATE:5.1f}s  peak={peak:.3f} rms={rms:.3f}")


def town() -> None:
    """Warm guild-town ensemble: strings, guitar, woodwind and hand percussion."""
    random.seed(1101)
    beat, left, right = canvas(88, 24)
    chords = [
        [48, 55, 60, 64], [47, 55, 59, 62], [45, 52, 57, 60], [43, 50, 55, 59],
        [41, 48, 53, 57], [43, 50, 55, 60], [45, 52, 57, 64], [43, 50, 55, 59],
    ]
    themes = [
        [67, 69, 72, 71, 67, 64, 65, 69],
        [72, 71, 69, 67, 64, 67, 69, 74],
    ]
    for bar in range(24):
        start = bar * 4 * beat
        chord = chords[bar % 8]
        section = bar // 6
        level = [0.68, 0.92, 1.06, 0.84][section]
        add_chord(left, right, start, 4.35 * beat, chord, 0.050 * level, "strings", 0.32, 0.74)
        add_note(left, right, start, 3.8 * beat, chord[0] - 12, 0.095 * level, -0.05, "bass", 0.035, 0.45)
        steps = 4 if section == 0 else 8
        for step in range(steps):
            when = start + step * 4 * beat / steps
            note = chord[(step + bar) % len(chord)] + 12
            add_note(left, right, when, 0.42 * beat, note, 0.047 * level, -0.50 + 1.0 * step / max(1, steps - 1), "nylon", 0.004, 0.12)
        if bar % 2 == 0 and bar not in {0, 22}:
            theme = themes[0 if bar < 12 or bar >= 18 else 1]
            lead_voice = "flute" if section != 2 else "oboe"
            for step, note in enumerate(theme):
                add_note(left, right, start + step * beat / 2, beat * 0.45, note, 0.063 * level, 0.25, lead_voice, 0.04, 0.16, 0.035)
        if section >= 1:
            add_drum(left, right, start, 0.075 * level, "kick")
            add_drum(left, right, start + 2 * beat, 0.058 * level, "tom", -0.12)
            for step in range(4):
                add_drum(left, right, start + (step + 0.5) * beat, 0.019 * level, "shaker", 0.38 if step % 2 else -0.38)
        if bar in {6, 12, 18}:
            add_drum(left, right, start, 0.060, "cymbal", 0.18)
    finish("town-bgm.wav", left, right, 0.175, 0.34)


def dungeon() -> None:
    """Sparse stone ambience that slowly reveals a nervous heartbeat."""
    random.seed(2202)
    beat, left, right = canvas(72, 20)
    chords = [[38, 45, 50, 53], [37, 44, 49, 52], [34, 41, 46, 50], [36, 43, 48, 51]]
    whispers = [62, 65, 61, 68, 64, 59]
    for bar in range(20):
        start = bar * 4 * beat
        chord = chords[bar % 4]
        section = bar // 5
        level = [0.56, 0.77, 1.00, 0.70][section]
        add_chord(left, right, start, 4.45 * beat, chord, 0.047 * level, "dark", 0.85, 1.18, 0.72)
        add_note(left, right, start, 4.1 * beat, chord[0] - 12, 0.120 * level, 0.0, "bass", 0.14, 0.82)
        hits = [0.65, 2.75] if section == 0 else [0.55, 1.8, 3.2]
        for index, pulse in enumerate(hits):
            note = chord[(bar + index * 2) % len(chord)] + 12
            add_note(left, right, start + pulse * beat, beat * 0.72, note, 0.043 * level, (-0.58 if index % 2 else 0.58), "crystal", 0.006, 0.38)
        if section >= 1 and bar % 2:
            for step in range(4):
                note = whispers[(bar + step) % len(whispers)]
                add_note(left, right, start + step * beat, beat * 0.68, note, 0.035 * level, 0.28, "flute", 0.16, 0.34, 0.06)
        add_drum(left, right, start, 0.080 * level, "boom")
        if section >= 2:
            add_drum(left, right, start + 2 * beat, 0.046 * level, "kick")
            add_drum(left, right, start + 3.5 * beat, 0.026 * level, "openhat", 0.45)
        if bar in {5, 10, 15}:
            add_whoosh(left, right, max(0, start - beat), beat * 1.1, 0.018, -0.75, 0.7)
    finish("dungeon-bgm.wav", left, right, 0.158, 0.58)


def deep() -> None:
    """Mechanical undercity pulse: irregular ostinato and warning brass."""
    random.seed(3303)
    beat, left, right = canvas(92, 24)
    chords = [[34, 41, 46, 50], [33, 40, 45, 49], [36, 43, 48, 53], [31, 38, 45, 50]]
    signal = [57, 60, 64, 63, 55, 58, 62, 65]
    for bar in range(24):
        start = bar * 4 * beat
        chord = chords[bar % 4]
        section = bar // 6
        level = [0.64, 0.86, 1.08, 0.79][section]
        add_chord(left, right, start, 4.2 * beat, chord, 0.052 * level, "strings", 0.38, 0.72)
        add_note(left, right, start, 4.0 * beat, chord[0] - 12, 0.135 * level, -0.05, "dark", 0.055, 0.52)
        pattern = [0, 3, 1, 3, 2, 0, 3, 1]
        for step, chord_index in enumerate(pattern):
            note = chord[chord_index] + 12 + (1 if step in {3, 7} and section >= 2 else 0)
            add_note(left, right, start + step * beat / 2, beat * 0.31, note, 0.046 * level, -0.58 if step % 2 else 0.52, "pulse", 0.004, 0.10)
            add_drum(left, right, start + step * beat / 2, 0.021 * level, "hat", 0.48 if step % 2 else -0.48)
        for pulse in [0, 1.5, 2.5]:
            add_drum(left, right, start + pulse * beat, (0.092 if pulse == 0 else 0.052) * level, "kick" if pulse != 1.5 else "tom")
        if bar % 4 == 3 or section == 2 and bar % 2:
            for step in range(4):
                add_note(left, right, start + step * beat * 0.75, beat * 0.55, signal[(bar + step) % len(signal)], 0.061 * level, 0.22, "brass", 0.03, 0.18)
        if bar in {6, 12, 18}:
            add_drum(left, right, start, 0.080, "cymbal", -0.25)
    finish("deep-bgm.wav", left, right, 0.180, 0.40)


def abyss() -> None:
    """Weighty ritual march with choir, sub pulses and unstable bells."""
    random.seed(4404)
    beat, left, right = canvas(104, 24)
    roots = [29, 30, 26, 31, 27, 29]
    ritual = [50, 53, 57, 56, 49, 52]
    for bar in range(24):
        start = bar * 4 * beat
        root = roots[bar % len(roots)]
        section = bar // 6
        level = [0.58, 0.82, 1.10, 0.76][section]
        chord = [root, root + 7, root + 12, root + 15]
        add_chord(left, right, start, 4.28 * beat, chord, 0.052 * level, "choir", 0.55, 0.90, 0.72)
        add_note(left, right, start, 4.2 * beat, root - 12, 0.155 * level, 0.0, "dark", 0.12, 0.66)
        for step, pulse in enumerate([0, 0.75, 1.5, 2.5, 3.0, 3.75]):
            note = ritual[(bar + step) % len(ritual)] + (12 if step == 5 else 0)
            add_note(left, right, start + pulse * beat, beat * 0.43, note, 0.048 * level, -0.62 + step * 0.24, "mallet", 0.004, 0.18)
        for pulse in [0, 1.5, 2.0, 3.5]:
            kind = "boom" if pulse in {0, 2.0} else "snare"
            gain = (0.105 if kind == "boom" else 0.038) * level
            add_drum(left, right, start + pulse * beat, gain, kind, 0.1 if pulse > 2 else -0.1)
        if section >= 1 and bar % 2 == 0:
            for note in [root + 24, root + 27, root + 31]:
                add_note(left, right, start + 2.7 * beat, 1.15 * beat, note, 0.036 * level, (note - root - 27) / 10, "choir", 0.22, 0.42, 0.025)
        if bar in {6, 12, 18}:
            add_whoosh(left, right, max(0, start - beat), 1.25 * beat, 0.027, 0.8, -0.8)
            add_drum(left, right, start, 0.080, "cymbal")
    finish("abyss-bgm.wav", left, right, 0.188, 0.49)


def battle() -> None:
    """Fast, readable combat loop with a heroic second-half melody."""
    random.seed(5505)
    beat, left, right = canvas(144, 24)
    chords = [[41, 48, 53, 57], [39, 46, 51, 55], [44, 51, 56, 60], [38, 45, 50, 54]]
    hero = [69, 72, 76, 75, 72, 77, 76, 72]
    for bar in range(24):
        start = bar * 4 * beat
        chord = chords[bar % 4]
        section = bar // 6
        level = [0.67, 0.91, 1.08, 0.86][section]
        for pulse in [0, 2]:
            add_chord(left, right, start + pulse * beat, 1.82 * beat, chord, 0.049 * level, "brass", 0.022, 0.18, 0.56)
        add_note(left, right, start, 1.88 * beat, chord[0] - 12, 0.150 * level, -0.04, "bass", 0.012, 0.20)
        add_note(left, right, start + 2 * beat, 1.88 * beat, chord[0] - 7, 0.138 * level, 0.04, "bass", 0.012, 0.20)
        for step in range(8):
            note = chord[(step + bar) % 4] + 12
            add_note(left, right, start + step * beat / 2, beat * 0.34, note, 0.052 * level, -0.48 if step % 2 else 0.48, "saw", 0.003, 0.075)
            add_drum(left, right, start + step * beat / 2, 0.025 * level, "hat", 0.42 if step % 2 else -0.42)
        for pulse in [0, 1.5, 2.0, 3.0]:
            add_drum(left, right, start + pulse * beat, (0.115 if pulse in {0, 2.0} else 0.068) * level, "kick" if pulse in {0, 2.0} else "snare")
        if section >= 1 and bar % 2 == 0:
            for step, note in enumerate(hero):
                add_note(left, right, start + step * beat / 2, beat * 0.43, note - (0 if section >= 2 else 12), 0.068 * level, 0.20, "brass", 0.012, 0.11)
        if bar in {6, 12, 18}:
            add_drum(left, right, start, 0.085, "cymbal", 0.15)
    finish("battle-bgm.wav", left, right, 0.195, 0.28)


def boss() -> None:
    """Boss score: orchestral low brass, choir and double-time percussion."""
    random.seed(6606)
    beat, left, right = canvas(160, 28)
    chords = [[29, 36, 41, 44], [28, 35, 40, 43], [26, 33, 38, 42], [31, 38, 43, 46]]
    omen = [65, 68, 72, 71, 63, 66, 70, 73]
    for bar in range(28):
        start = bar * 4 * beat
        chord = chords[bar % 4]
        section = min(3, bar // 7)
        level = [0.61, 0.86, 1.12, 0.91][section]
        add_chord(left, right, start, 3.92 * beat, chord, 0.055 * level, "choir", 0.10, 0.42, 0.68)
        add_chord(left, right, start, 1.42 * beat, [chord[0], chord[1], chord[2]], 0.067 * level, "brass", 0.018, 0.16, 0.48)
        add_chord(left, right, start + 2 * beat, 1.42 * beat, [chord[0], chord[1], chord[3]], 0.067 * level, "brass", 0.018, 0.16, 0.48)
        add_note(left, right, start, 3.8 * beat, chord[0] - 12, 0.165 * level, 0.0, "dark", 0.04, 0.38)
        for step in range(8):
            add_drum(left, right, start + step * beat / 2, 0.027 * level, "hat", -0.48 if step % 2 else 0.48)
        for pulse in [0, 0.75, 1.5, 2.0, 2.75, 3.5]:
            strong = pulse in {0, 1.5, 2.0, 3.5}
            add_drum(left, right, start + pulse * beat, (0.128 if strong else 0.072) * level, "kick" if strong else "snare")
        if bar % 2 == 0:
            for step, note in enumerate(omen):
                add_note(left, right, start + step * beat / 2, beat * 0.42, note - (12 if section == 0 else 0), 0.075 * level, 0.25, "brass", 0.009, 0.10)
        if section >= 2 and bar % 2:
            for step, note in enumerate([chord[2] + 24, chord[3] + 24, chord[2] + 19, chord[3] + 24]):
                add_note(left, right, start + step * beat, beat * 0.82, note, 0.048 * level, -0.30 + step * 0.20, "choir", 0.07, 0.22, 0.03)
        if bar in {7, 14, 21}:
            add_whoosh(left, right, max(0, start - 1.5 * beat), 1.6 * beat, 0.035, -0.9, 0.9)
            add_drum(left, right, start, 0.115, "cymbal")
            add_drum(left, right, start, 0.105, "boom")
    finish("boss-bgm.wav", left, right, 0.205, 0.34)


def tension(stage: int) -> None:
    """Five-step threat score used when out-of-depth enemies are present.

    All five cues share a small chromatic warning cell so switching intensity
    reads as the same danger growing closer.  Tempo, subdivision, percussion,
    harmonic friction, sub weight and orchestration are deliberately increased
    at every step.  The final quarter thins just enough to make the loop back
    to its opening feel like another breath rather than a hard restart.
    """
    if stage not in range(1, 6):
        raise ValueError("tension stage must be between 1 and 5")

    random.seed(7100 + stage * 137)
    bpms = (82, 96, 112, 132, 154)
    bar_counts = (16, 16, 20, 20, 24)
    target_rms = (0.150, 0.162, 0.174, 0.186, 0.198)
    room = (0.58, 0.51, 0.44, 0.37, 0.31)
    widths = (1.34, 1.38, 1.42, 1.46, 1.48)
    beat, left, right = canvas(bpms[stage - 1], bar_counts[stage - 1])
    bars = bar_counts[stage - 1]

    # D Phrygian and its chromatic lower neighbour give the loop a circular,
    # unresolved pull.  Higher stages introduce the minor second and tritone
    # lower in the voicing, where their beating is much harder to ignore.
    roots = [38, 39, 34, 37]
    warning_cell = [0, 1, 6, 5, 0, 8, 7, 1]
    section_levels = (
        (0.57, 0.73, 0.91, 0.65),
        (0.61, 0.80, 1.00, 0.71),
        (0.64, 0.86, 1.07, 0.76),
        (0.67, 0.91, 1.12, 0.80),
        (0.70, 0.96, 1.17, 0.84),
    )[stage - 1]
    subdivisions = (4, 6, 8, 12, 16)[stage - 1]
    ostinato_gain = (0.031, 0.037, 0.043, 0.049, 0.054)[stage - 1]

    for bar in range(bars):
        start = bar * 4 * beat
        section = min(3, int(bar * 4 / bars))
        level = section_levels[section]
        root = roots[bar % len(roots)]

        if stage == 1:
            harmony = [root + 12, root + 19, root + 24, root + 27]
        elif stage == 2:
            harmony = [root + 12, root + 19, root + 24, root + 25, root + 27]
        elif stage == 3:
            harmony = [root + 12, root + 18, root + 24, root + 25, root + 27]
        elif stage == 4:
            harmony = [root + 12, root + 13, root + 18, root + 24, root + 27]
        else:
            harmony = [root + 12, root + 13, root + 18, root + 24, root + 25, root + 30]

        pad_voice = "dark" if stage == 1 else "strings" if stage <= 3 else "choir"
        pad_gain = (0.043, 0.045, 0.047, 0.048, 0.047)[stage - 1] * level
        add_chord(left, right, start, 4.25 * beat, harmony, pad_gain, pad_voice, 0.48, 0.78, 0.74)
        if stage >= 4:
            # A close, darker layer keeps the upper choir from making late
            # stages feel merely grand instead of dangerous.
            add_chord(
                left,
                right,
                start,
                4.08 * beat,
                [root + 12, root + 18, root + 25],
                0.022 * level,
                "dark",
                0.20,
                0.48,
                0.48,
            )

        # One sustained bass voice at stage one grows into a pulsing two-octave
        # engine.  Keeping a stable centre preserves impact on phone speakers.
        add_note(
            left,
            right,
            start,
            4.08 * beat,
            root - 12,
            (0.102 + stage * 0.012) * level,
            0.0,
            "bass",
            0.045 if stage >= 3 else 0.11,
            0.40,
        )
        if stage >= 3:
            low_pulses = 2 if stage == 3 else 4 if stage == 4 else 8
            for pulse in range(low_pulses):
                add_note(
                    left,
                    right,
                    start + pulse * 4 * beat / low_pulses,
                    0.40 * beat,
                    root + (0 if pulse % 4 else 12),
                    (0.032 + 0.005 * stage) * level,
                    0.0,
                    "pulse",
                    0.004,
                    0.09,
                )

        # The ostinato evolves from four isolated signals to a continuous,
        # double-time chromatic machine.  Accented notes preserve the motif at
        # high density instead of turning it into an indistinct buzz.
        for step in range(subdivisions):
            ratio = step / subdivisions
            cell_index = (step + bar * (stage + 1)) % len(warning_cell)
            interval = warning_cell[cell_index]
            if stage <= 2 and interval in {1, 6} and section == 0:
                interval = 0 if interval == 1 else 5
            note = root + 12 + interval + (12 if stage == 5 and step in {7, 15} else 0)
            accent = 1.30 if step % max(1, subdivisions // 4) == 0 else 0.80
            pan = (-0.62 if step % 2 else 0.62) * (0.65 + 0.07 * stage)
            add_note(
                left,
                right,
                start + ratio * 4 * beat,
                (2.28 / subdivisions) * beat,
                note,
                ostinato_gain * accent * level,
                pan,
                "crystal" if stage == 1 else "pulse" if stage <= 3 else "saw",
                0.003,
                0.075 if stage >= 4 else 0.13,
            )

        # Percussion density rises monotonically.  Stage one is a distant
        # heartbeat; stage five interlocks sixteenth hats, kicks and snares.
        if stage == 1:
            if bar % 2 == 0:
                add_drum(left, right, start, 0.074 * level, "boom")
            if section >= 2:
                add_drum(left, right, start + 2.5 * beat, 0.032 * level, "tom", -0.12)
        elif stage == 2:
            for pulse, kind in [(0, "boom"), (2.5, "kick")]:
                add_drum(left, right, start + pulse * beat, (0.083 if kind == "boom" else 0.054) * level, kind)
            if section >= 1:
                for pulse in (0.5, 1.5, 2.5, 3.5):
                    add_drum(left, right, start + pulse * beat, 0.014 * level, "shaker", 0.35 if pulse % 2 else -0.35)
        elif stage == 3:
            for pulse, kind in [(0, "kick"), (1.5, "snare"), (2.5, "kick"), (3.25, "tom")]:
                add_drum(left, right, start + pulse * beat, (0.085 if kind == "kick" else 0.043) * level, kind)
            for pulse in range(8):
                add_drum(left, right, start + pulse * beat / 2, 0.017 * level, "hat", -0.42 if pulse % 2 else 0.42)
        elif stage == 4:
            for pulse, kind in [(0, "kick"), (0.75, "tom"), (1.5, "snare"), (2, "kick"), (2.75, "tom"), (3.5, "snare")]:
                add_drum(left, right, start + pulse * beat, (0.098 if kind == "kick" else 0.052) * level, kind)
            for pulse in range(12):
                add_drum(left, right, start + pulse * beat / 3, 0.018 * level, "hat", -0.48 if pulse % 2 else 0.48)
        else:
            for pulse in range(8):
                kind = "kick" if pulse % 2 == 0 else "snare"
                gain = 0.109 if kind == "kick" else 0.057
                add_drum(left, right, start + pulse * beat / 2, gain * level, kind, -0.08 if kind == "kick" else 0.10)
            for pulse in range(16):
                add_drum(left, right, start + pulse * beat / 4, 0.019 * level, "hat", -0.52 if pulse % 2 else 0.52)
            if section >= 1:
                add_drum(left, right, start + 3.75 * beat, 0.027 * level, "openhat", 0.42)

        # Warning calls expand from a barely audible two-note answer into a
        # full brass/choir statement.  This gives each quarter a real musical
        # development rather than relying on loudness alone.
        if section >= 1 and bar % 2 == 0:
            call_length = min(8, 2 + stage + section)
            lead_voice = "oboe" if stage == 1 else "brass" if stage <= 4 else "choir"
            for step in range(call_length):
                interval = warning_cell[step]
                when = start + (step * 4 / call_length) * beat
                add_note(
                    left,
                    right,
                    when,
                    (2.45 / call_length) * beat,
                    root + 24 + interval,
                    (0.031 + stage * 0.006) * level,
                    0.20,
                    lead_voice,
                    0.012 if stage >= 3 else 0.045,
                    0.12,
                    0.025 if lead_voice in {"oboe", "choir"} else 0.0,
                )

        # Section punctuation remains intentionally below the main transients;
        # it marks escalation without making every loop sound like a boss win.
        section_size = bars // 4
        if bar in {section_size, section_size * 2, section_size * 3}:
            add_whoosh(left, right, max(0, start - 1.15 * beat), 1.20 * beat, 0.010 + stage * 0.004, -0.78, 0.78)
            add_drum(left, right, start, (0.043 + stage * 0.010) * level, "cymbal", 0.18)
            if stage >= 4:
                add_drum(left, right, start, 0.060 * level, "boom")

    finish(
        f"tension-{stage}-bgm.wav",
        left,
        right,
        target_rms[stage - 1],
        room[stage - 1],
        widths[stage - 1],
        True,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Render the game's procedural loop music.")
    parser.add_argument(
        "--tension-only",
        action="store_true",
        help="render only tension-1 through tension-5, preserving the six core WAV files",
    )
    args = parser.parse_args()
    ROOT.mkdir(parents=True, exist_ok=True)
    core_renderers = () if args.tension_only else (town, dungeon, deep, abyss, battle, boss)
    for render in core_renderers:
        render()
    for stage in range(1, 6):
        tension(stage)


if __name__ == "__main__":
    main()
