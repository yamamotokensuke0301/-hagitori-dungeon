"""Render the looping game scores without external samples.

The renderer stays dependency-free so every source tone can be recreated from
the repository.  Version 2 of the engine replaces the additive sine stacks
with wavetable oscillators, filter envelopes, formant vowels, Karplus-Strong
plucked strings, FM bells, redesigned percussion and a Freeverb-style room.
Each cue keeps its own orchestration and a clear four-part arc; the shared
mastering stage keeps loudness and stereo width consistent without
flattening those dynamics.

Orchestral cues (town, battle, boss) lean melodic and warm; the dungeon
family (dungeon, deep, abyss, tension) leans dark-ambient with texture and
air instead of constant note grids.
"""

from __future__ import annotations

import argparse
import math
import random
import struct
import time
import wave
from array import array
from pathlib import Path


RATE = 48_000
TAU = math.tau
ROOT = Path(__file__).resolve().parents[1] / "assets" / "audio"
TABLE_SIZE = 4096


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


# ---------------------------------------------------------------------------
# Wavetables
# ---------------------------------------------------------------------------

# Harmonic recipes.  Each entry maps harmonic number -> amplitude and is
# band-limited at build time, so high notes never alias.
def _recipe(wave: str, cap: int) -> list[tuple[int, float]]:
    partials: list[tuple[int, float]] = []
    for n in range(1, cap + 1):
        if wave == "saw":
            amp = 1.0 / n
        elif wave == "square":
            amp = 1.0 / n if n % 2 else 0.0
        elif wave == "reed":
            # Odd-heavy with a little even bleed: nasal double-reed body.
            amp = (1.0 / n) if n % 2 else (0.32 / n)
        elif wave == "flute":
            amp = {1: 1.0, 2: 0.34, 3: 0.10, 4: 0.035}.get(n, 0.0)
        elif wave == "organ":
            amp = {1: 1.0, 2: 0.62, 3: 0.28, 4: 0.38, 6: 0.16, 8: 0.12}.get(n, 0.0)
        elif wave == "bassy":
            amp = {1: 1.0, 2: 0.42, 3: 0.14, 4: 0.05}.get(n, 0.0)
        elif wave == "hollow":
            amp = {1: 1.0, 3: 0.36, 5: 0.16, 7: 0.07}.get(n, 0.0)
        else:  # sine
            amp = 1.0 if n == 1 else 0.0
        if amp:
            partials.append((n, amp))
    return partials


_TABLE_CACHE: dict[tuple[str, int], array] = {}
_CAP_STEPS = (1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64)


def _get_table(wave: str, cap: int) -> array:
    for step in _CAP_STEPS:
        if step >= cap:
            cap = step
            break
    else:
        cap = _CAP_STEPS[-1]
    key = (wave, cap)
    table = _TABLE_CACHE.get(key)
    if table is not None:
        return table
    partials = _recipe(wave, cap)
    data = array("f", [0.0]) * TABLE_SIZE
    for n, amp in partials:
        for i in range(TABLE_SIZE):
            data[i] += amp * math.sin(TAU * n * i / TABLE_SIZE)
    peak = max(1e-6, max(abs(v) for v in data))
    for i in range(TABLE_SIZE):
        data[i] /= peak
    _TABLE_CACHE[key] = data
    return data


def _table_for(wave: str, freq: float) -> array:
    cap = max(1, int((RATE * 0.45) / max(freq, 20.0)))
    return _get_table(wave, min(cap, 64))


# ---------------------------------------------------------------------------
# Voice definitions
# ---------------------------------------------------------------------------

# Each tonal voice: base wave, unison detune ratios with gains, low-pass
# envelope (start Hz, end Hz, rise seconds), optional sub oscillator, breath
# noise, formant band-passes and default vibrato.
VOICES: dict[str, dict] = {
    "strings": {
        "wave": "saw",
        "unison": ((0.9974, 0.55), (1.0, 1.0), (1.0027, 0.55), (1.0051, 0.30)),
        "lp": (900.0, 2600.0, 0.35),
        "vib": (0.010, 5.0, 0.30),
    },
    "cello": {
        "wave": "saw",
        "unison": ((0.9983, 0.6), (1.0, 1.0), (1.0018, 0.6)),
        "lp": (500.0, 1400.0, 0.30),
        "sub": 0.25,
        "vib": (0.008, 4.6, 0.35),
    },
    "brass": {
        "wave": "saw",
        "unison": ((0.9987, 0.7), (1.0, 1.0), (1.0014, 0.7)),
        "lp": (520.0, 3900.0, 0.11),
        "scoop": -0.8,
        "vib": (0.006, 5.4, 0.22),
    },
    "flute": {
        "wave": "flute",
        "unison": ((1.0, 1.0),),
        "breath": 0.055,
        "vib": (0.017, 5.1, 0.18),
    },
    "oboe": {
        "wave": "reed",
        "unison": ((1.0, 1.0),),
        "lp": (2600.0, 2600.0, 0.01),
        "formants": ((1400.0, 0.10, 0.9),),
        "vib": (0.012, 5.3, 0.20),
    },
    "choir": {
        "wave": "saw",
        "unison": ((0.9962, 0.6), (1.0, 1.0), (1.0039, 0.6)),
        "formants": ((640.0, 0.09, 1.0), (1120.0, 0.075, 0.52), (2520.0, 0.06, 0.22)),
        "breath": 0.012,
        "vib": (0.009, 4.4, 0.55),
    },
    "organ": {
        "wave": "organ",
        "unison": ((0.9992, 0.8), (1.0008, 0.8)),
    },
    "bass": {
        "wave": "bassy",
        "unison": ((1.0, 1.0),),
        "lp": (700.0, 700.0, 0.01),
        "sub": 0.35,
    },
    "dark": {
        "wave": "hollow",
        "unison": ((0.9989, 0.8), (1.0012, 0.8)),
        "lp": (420.0, 420.0, 0.01),
        "sub": 0.55,
    },
    "pulse": {
        "wave": "square",
        "unison": ((1.0, 1.0),),
        "lp": (1500.0, 1500.0, 0.01),
    },
    "saw": {
        "wave": "saw",
        "unison": ((0.996, 0.7), (1.0, 1.0), (1.004, 0.7)),
        "lp": (2600.0, 2600.0, 0.01),
    },
}


def add_tone(
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
    vibrato: float = -1.0,
    bend: float = 0.0,
) -> None:
    """Render one sustained tone with the voice's filters and motion."""
    begin = max(0, int(start * RATE))
    end = min(len(left), int((start + duration) * RATE))
    if begin >= end:
        return
    cfg = VOICES[voice]
    freq0 = hz(midi)
    table = _table_for(cfg["wave"], freq0)
    mask = TABLE_SIZE - 1
    unison = cfg["unison"]
    phases = [random.random() * TABLE_SIZE for _ in unison]
    ugain = 1.0 / sum(g for _, g in unison)

    lp = cfg.get("lp")
    lp_y1 = lp_y2 = 0.0
    sub = cfg.get("sub", 0.0)
    sub_phase = random.random() * TAU
    breath = cfg.get("breath", 0.0)
    breath_y = 0.0
    formants = cfg.get("formants")
    fstates = [[0.0, 0.0] for _ in formants] if formants else None
    fcoefs = (
        [(2.0 * math.sin(math.pi * min(fc, 20000.0) / RATE), q, g) for fc, q, g in formants]
        if formants
        else None
    )
    vib_depth, vib_rate, vib_delay = cfg.get("vib", (0.0, 5.0, 0.2))
    if vibrato >= 0.0:
        vib_depth = vibrato
    scoop = cfg.get("scoop", 0.0)
    vib_phase = random.random() * TAU

    pan = max(-0.98, min(0.98, pan))
    lg = gain * math.sqrt((1.0 - pan) * 0.5)
    rg = gain * math.sqrt((1.0 + pan) * 0.5)
    motion_phase = random.random() * TAU
    step_base = TABLE_SIZE / RATE

    for index in range(begin, end):
        t = (index - begin) / RATE
        env = envelope(t, duration, attack, release)
        ratio = 1.0
        if vib_depth:
            depth = vib_depth * _smoothstep(t / max(vib_delay, 0.01))
            ratio += depth * math.sin(TAU * vib_rate * t + vib_phase)
        if scoop:
            ratio *= 2.0 ** ((scoop * math.exp(-t / 0.045)) / 12.0)
        if bend:
            ratio *= 2.0 ** ((bend * t / max(duration, 0.01)) / 12.0)
        freq = freq0 * ratio
        step = freq * step_base
        sample = 0.0
        for u, (uratio, ug) in enumerate(unison):
            phase = phases[u] + step * uratio
            if phase >= TABLE_SIZE:
                phase -= TABLE_SIZE
                if phase >= TABLE_SIZE:
                    phase = phase % TABLE_SIZE
            phases[u] = phase
            idx = int(phase)
            frac = phase - idx
            a = table[idx]
            b = table[(idx + 1) & mask]
            sample += (a + (b - a) * frac) * ug
        sample *= ugain
        if sub:
            sub_phase += TAU * freq * 0.5 / RATE
            sample += sub * math.sin(sub_phase)
        if lp:
            fc = lp[0] + (lp[1] - lp[0]) * _smoothstep(t / max(lp[2], 0.005))
            a1 = min(0.98, TAU * fc / RATE)
            lp_y1 += a1 * (sample - lp_y1)
            lp_y2 += a1 * (lp_y1 - lp_y2)
            sample = lp_y2
        if fcoefs:
            shaped = sample * 0.22
            for fi, (f, q, fg) in enumerate(fcoefs):
                low, band = fstates[fi]
                high = sample - low - q * band
                band += f * high
                low += f * band
                fstates[fi][0] = low
                fstates[fi][1] = band
                shaped += band * fg
            sample = shaped
        if breath:
            noise = random.random() * 2.0 - 1.0
            breath_y += 0.24 * (noise - breath_y)
            sample += breath_y * breath * (1.5 - 0.5 * env)
        motion = 1.0 + 0.022 * math.sin(TAU * 0.29 * t + motion_phase)
        value = sample * env
        left[index] += value * lg * motion
        right[index] += value * rg * (2.0 - motion)


BELLS = {
    # name: (mod ratio, fm index, index decay, amp decay, strike noise)
    "crystal": (2.667, 1.15, 4.5, 3.2, 0.010),
    "mallet": (3.98, 0.85, 7.0, 5.0, 0.030),
    "celesta": (3.01, 0.55, 9.0, 4.2, 0.012),
    "toll": (1.41, 2.10, 1.2, 0.9, 0.045),
}


def add_bell(
    left: array,
    right: array,
    start: float,
    duration: float,
    midi: float,
    gain: float,
    pan: float = 0.0,
    voice: str = "crystal",
) -> None:
    """Two-operator FM bell with a soft strike transient."""
    begin = max(0, int(start * RATE))
    end = min(len(left), int((start + duration) * RATE))
    if begin >= end:
        return
    ratio, index0, index_decay, amp_decay, strike = BELLS[voice]
    freq = hz(midi)
    pan = max(-0.98, min(0.98, pan))
    lg = gain * math.sqrt((1.0 - pan) * 0.5)
    rg = gain * math.sqrt((1.0 + pan) * 0.5)
    phase_offset = random.random() * TAU
    wc = TAU * freq
    wm = TAU * freq * ratio
    noise_y = 0.0
    for index in range(begin, end):
        t = (index - begin) / RATE
        fall = _smoothstep((duration - t) / 0.08)
        fm = index0 * math.exp(-index_decay * t)
        sample = math.sin(wc * t + fm * math.sin(wm * t + phase_offset)) * math.exp(-amp_decay * t)
        if strike and t < 0.02:
            noise = random.random() * 2.0 - 1.0
            noise_y += 0.5 * (noise - noise_y)
            sample += noise_y * strike * (1.0 - t / 0.02) * 30.0
        rise = t / 0.002 if t < 0.002 else 1.0
        value = sample * rise * fall
        left[index] += value * lg
        right[index] += value * rg


def add_pluck(
    left: array,
    right: array,
    start: float,
    duration: float,
    midi: float,
    gain: float,
    pan: float = 0.0,
    brightness: float = 0.55,
) -> None:
    """Karplus-Strong plucked string (harp / nylon guitar family)."""
    begin = max(0, int(start * RATE))
    end = min(len(left), int((start + duration) * RATE))
    if begin >= end:
        return
    freq = hz(midi)
    period = max(2, int(RATE / freq))
    # Excitation: lightly low-passed noise burst so high notes stay round.
    buffer = []
    prev = 0.0
    for _ in range(period):
        noise = random.random() * 2.0 - 1.0
        prev += (0.35 + brightness * 0.5) * (noise - prev)
        buffer.append(prev)
    # Loss so the string rings for roughly the requested duration.
    periods = max(1.0, duration * freq)
    rho = 0.001 ** (1.0 / periods)
    pan = max(-0.98, min(0.98, pan))
    lg = gain * math.sqrt((1.0 - pan) * 0.5)
    rg = gain * math.sqrt((1.0 + pan) * 0.5)
    pointer = 0
    for index in range(begin, end):
        t = (index - begin) / RATE
        sample = buffer[pointer]
        nxt = buffer[(pointer + 1) % period]
        buffer[pointer] = (sample + nxt) * 0.5 * rho
        pointer = (pointer + 1) % period
        fall = _smoothstep((duration - t) / 0.05)
        value = sample * fall
        left[index] += value * lg
        right[index] += value * rg


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
    stagger: float = 0.0,
) -> None:
    count = max(1, len(notes) - 1)
    for index, note in enumerate(notes):
        pan = -spread + 2.0 * spread * index / count
        add_tone(
            left,
            right,
            start + stagger * index,
            duration - stagger * index,
            note,
            gain,
            pan,
            voice,
            attack,
            release,
        )


def add_harp_chord(
    left: array,
    right: array,
    start: float,
    notes: list[int],
    gain: float,
    duration: float = 1.6,
    spread: float = 0.5,
    stagger: float = 0.035,
) -> None:
    count = max(1, len(notes) - 1)
    for index, note in enumerate(notes):
        pan = -spread + 2.0 * spread * index / count
        add_pluck(left, right, start + stagger * index, duration, note, gain, pan)


# ---------------------------------------------------------------------------
# Percussion
# ---------------------------------------------------------------------------

_HAT_RATIOS = (2.0, 3.0, 4.16, 5.43, 6.79, 8.21)


def add_drum(left: array, right: array, start: float, gain: float, kind: str, pan: float = 0.0) -> None:
    durations = {
        "kick": 0.40,
        "snare": 0.34,
        "hat": 0.09,
        "openhat": 0.42,
        "tom": 0.50,
        "cymbal": 2.30,
        "shaker": 0.13,
        "boom": 1.30,
    }
    duration = durations[kind]
    begin = max(0, int(start * RATE))
    end = min(len(left), int((start + duration) * RATE))
    if begin >= end:
        return
    pan = max(-0.95, min(0.95, pan))
    lg = gain * math.sqrt((1.0 - pan) * 0.5)
    rg = gain * math.sqrt((1.0 + pan) * 0.5)
    previous_noise = 0.0
    band = low = 0.0
    metal_phase = random.random() * TAU
    for index in range(begin, end):
        t = (index - begin) / RATE
        noise = random.random() * 2.0 - 1.0
        high_noise = noise - previous_noise * 0.88
        previous_noise = noise
        if kind == "kick":
            # Exponential pitch sweep with a click and light saturation.
            freq = 44.0 + 116.0 * math.exp(-t / 0.028)
            body = math.sin(TAU * (44.0 * t + 116.0 * 0.028 * (1.0 - math.exp(-t / 0.028))))
            sample = body * math.exp(-7.5 * t) * 1.25
            if t < 0.004:
                sample += high_noise * 0.55 * (1.0 - t / 0.004)
            sample = math.tanh(sample * 1.6) * 0.8
        elif kind == "snare":
            shell = (math.sin(TAU * 186 * t) + 0.6 * math.sin(TAU * 332 * t)) * math.exp(-21.0 * t)
            f = 2.0 * math.sin(math.pi * 2400.0 / RATE)
            high = noise - low - 0.55 * band
            band += f * high
            low += f * band
            sample = 0.42 * shell + 0.85 * band * math.exp(-10.5 * t)
        elif kind in {"hat", "openhat"}:
            metallic = 0.0
            for ratio in _HAT_RATIOS:
                metallic += 1.0 if math.sin(TAU * 431.0 * ratio * t + metal_phase * ratio) > 0 else -1.0
            metallic /= len(_HAT_RATIOS)
            mix = 0.62 * metallic + 0.55 * high_noise
            hp = mix - low
            low += 0.25 * (mix - low)
            decay = 42.0 if kind == "hat" else 9.5
            sample = hp * math.exp(-decay * t)
        elif kind == "tom":
            freq_int = 96.0 * t + 68.0 * 0.05 * (1.0 - math.exp(-t / 0.05))
            sample = math.sin(TAU * freq_int) * math.exp(-8.5 * t) + 0.08 * high_noise * math.exp(-30.0 * t)
        elif kind == "cymbal":
            metallic = 0.0
            for ratio in _HAT_RATIOS:
                metallic += math.sin(TAU * 517.0 * ratio * ratio * t + metal_phase * ratio)
            shimmer = math.sin(TAU * 9.0 * t)
            body = 0.55 * high_noise + 0.30 * metallic / len(_HAT_RATIOS)
            hp = body - low
            low += 0.18 * (body - low)
            sample = hp * math.exp(-2.1 * t) * (1.0 + 0.12 * shimmer)
        elif kind == "shaker":
            pulse = min(1.0, t * 140.0) * math.exp(-30.0 * t)
            hp = high_noise - low
            low += 0.4 * (high_noise - low)
            sample = hp * pulse
        else:  # boom: taiko-like depth with skin noise
            freq_int = 46.0 * t + 42.0 * 0.06 * (1.0 - math.exp(-t / 0.06))
            body = math.sin(TAU * freq_int) * math.exp(-3.1 * t)
            skin = high_noise * math.exp(-24.0 * t) * 0.35
            sample = math.tanh((body + skin) * 1.4) * 0.85
        left[index] += sample * lg
        right[index] += sample * rg


def add_timpani(left: array, right: array, start: float, midi: float, gain: float, pan: float = 0.0) -> None:
    begin = max(0, int(start * RATE))
    end = min(len(left), int((start + 1.6) * RATE))
    if begin >= end:
        return
    freq = hz(midi)
    pan = max(-0.95, min(0.95, pan))
    lg = gain * math.sqrt((1.0 - pan) * 0.5)
    rg = gain * math.sqrt((1.0 + pan) * 0.5)
    previous = low = 0.0
    for index in range(begin, end):
        t = (index - begin) / RATE
        bendf = freq * (1.0 + 0.035 * math.exp(-t / 0.06))
        body = math.sin(TAU * bendf * t) + 0.42 * math.sin(TAU * bendf * 1.5 * t) + 0.18 * math.sin(TAU * bendf * 1.98 * t)
        noise = random.random() * 2.0 - 1.0
        thump = (noise - previous * 0.6) * math.exp(-70.0 * t) * 0.5
        previous = noise
        sample = body * math.exp(-4.2 * t) * 0.6 + thump
        low += 0.35 * (sample - low)
        left[index] += low * lg
        right[index] += low * rg


def add_wind(
    left: array,
    right: array,
    start: float,
    duration: float,
    gain: float,
    fc_low: float = 260.0,
    fc_high: float = 900.0,
    drift: float = 0.05,
) -> None:
    """Slowly breathing filtered-noise layer for dark ambience."""
    begin = max(0, int(start * RATE))
    end = min(len(left), int((start + duration) * RATE))
    if begin >= end:
        return
    y1 = y2 = 0.0
    lfo_a = random.random() * TAU
    lfo_b = random.random() * TAU
    pan_phase = random.random() * TAU
    for index in range(begin, end):
        t = (index - begin) / RATE
        edge = min(_smoothstep(t / 3.0), _smoothstep((duration - t) / 3.0))
        breathe = 0.55 + 0.45 * math.sin(TAU * drift * t + lfo_a)
        fc = fc_low + (fc_high - fc_low) * (0.5 + 0.5 * math.sin(TAU * drift * 0.63 * t + lfo_b))
        a1 = min(0.9, TAU * fc / RATE)
        noise = random.random() * 2.0 - 1.0
        y1 += a1 * (noise - y1)
        y2 += a1 * (y1 - y2)
        pan = 0.55 * math.sin(TAU * 0.017 * t + pan_phase)
        value = y2 * gain * edge * breathe
        left[index] += value * math.sqrt((1.0 - pan) * 0.5)
        right[index] += value * math.sqrt((1.0 + pan) * 0.5)


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


def play_melody(
    left: array,
    right: array,
    start: float,
    beat: float,
    phrase: list[tuple[float, float, float]],
    voice: str,
    gain: float,
    pan: float = 0.2,
    articulation: float = 0.92,
    octave: int = 0,
) -> None:
    """phrase entries are (beat offset, beats held, midi)."""
    for offset, held, midi in phrase:
        add_tone(
            left,
            right,
            start + offset * beat,
            held * beat * articulation,
            midi + octave,
            gain,
            pan,
            voice,
            attack=0.018 if voice == "brass" else 0.035,
            release=0.10,
        )


def canvas(bpm: float, bars: int) -> tuple[float, array, array]:
    beat = 60.0 / bpm
    size = int(bars * 4 * beat * RATE)
    return beat, array("f", [0.0]) * size, array("f", [0.0]) * size


# ---------------------------------------------------------------------------
# Room and mastering
# ---------------------------------------------------------------------------

_COMB_TUNINGS = (1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617)
_ALLPASS_TUNINGS = (556, 441, 341, 225)
_STEREO_SPREAD = 23


def _reverb(left: array, right: array, room: float, damp: float, wet: float) -> None:
    """Freeverb-style room: parallel combs into serial allpasses."""
    scale = RATE / 44100.0
    feedback = 0.70 + 0.28 * max(0.0, min(1.0, room))
    damp = max(0.0, min(0.9, damp))
    dry = 1.0

    for channel, offset in ((left, 0), (right, _STEREO_SPREAD)):
        combs = []
        for tuning in _COMB_TUNINGS:
            size = int((tuning + offset) * scale)
            combs.append([array("f", [0.0]) * size, 0, 0.0, size])
        allpasses = []
        for tuning in _ALLPASS_TUNINGS:
            size = int((tuning + offset) * scale)
            allpasses.append([array("f", [0.0]) * size, 0, size])
        length = len(channel)
        for index in range(length):
            inp = channel[index] * 0.030
            out = 0.0
            for comb in combs:
                buf, pos, store, size = comb
                y = buf[pos]
                out += y
                store = y * (1.0 - damp) + store * damp
                buf[pos] = inp + store * feedback
                pos += 1
                if pos >= size:
                    pos = 0
                comb[1] = pos
                comb[2] = store
            for ap in allpasses:
                buf, pos, size = ap
                y = buf[pos]
                buf[pos] = out + y * 0.5
                out = y - out
                pos += 1
                if pos >= size:
                    pos = 0
                ap[1] = pos
            channel[index] = channel[index] * dry + out * wet


def _master(left: array, right: array, target_rms: float, room: float, damp: float, wet: float, width: float) -> tuple[float, float]:
    """Real room, gentle bus compression, then conservative normalization."""
    _reverb(left, right, room, damp, wet)

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
    room: float = 0.62,
    damp: float = 0.42,
    wet: float = 0.30,
    width: float = 1.30,
    density_makeup: bool = True,
    started: float | None = None,
) -> None:
    peak, rms = _master(left, right, target_rms, room, damp, wet, width)
    # Dense threat arrangements can hit the conservative peak ceiling before
    # their body reaches the requested RMS.  A second, very soft makeup pass
    # raises that body while rounding only the isolated tallest transients.
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
    took = f"  ({time.time() - started:5.1f}s render)" if started else ""
    print(f"rendered {name:16} {len(left) / RATE:5.1f}s  peak={peak:.3f} rms={rms:.3f}{took}")


# ---------------------------------------------------------------------------
# Cues
# ---------------------------------------------------------------------------


def town() -> None:
    """Warm guild-town orchestra: strings, harp, flute lead, celesta light."""
    started = time.time()
    random.seed(1101)
    beat, left, right = canvas(88, 24)
    chords = [
        [48, 55, 60, 64], [47, 55, 59, 62], [45, 52, 57, 60], [43, 50, 55, 59],
        [41, 48, 53, 57], [43, 50, 55, 60], [45, 52, 57, 64], [43, 50, 55, 59],
    ]
    # Two answered phrases, each two bars long (8 beats).
    phrase_a = [
        (0.0, 1.0, 76), (1.0, 0.5, 74), (1.5, 0.5, 72), (2.0, 1.5, 74), (3.5, 0.5, 71),
        (4.0, 1.0, 72), (5.0, 0.5, 69), (5.5, 0.5, 67), (6.0, 2.0, 69),
    ]
    phrase_b = [
        (0.0, 0.75, 72), (0.75, 0.25, 74), (1.0, 1.0, 76), (2.0, 1.0, 79), (3.0, 1.0, 77),
        (4.0, 1.5, 76), (5.5, 0.5, 74), (6.0, 2.0, 72),
    ]
    for bar in range(24):
        start = bar * 4 * beat
        chord = chords[bar % 8]
        section = bar // 6
        level = [0.66, 0.90, 1.06, 0.82][section]
        add_chord(left, right, start, 4.4 * beat, chord, 0.052 * level, "strings", 0.42, 0.85, 0.58)
        add_tone(left, right, start, 3.9 * beat, chord[0] - 12, 0.100 * level, -0.05, "cello", 0.06, 0.5)
        # Harp keeps eighth-note motion; broken chord rises then falls.
        steps = 4 if section == 0 else 8
        shape = [0, 1, 2, 3, 2, 3, 1, 2]
        for step in range(steps):
            when = start + step * 4 * beat / steps
            note = chord[shape[step] % len(chord)] + 12
            add_pluck(left, right, when, 1.1 * beat, note, 0.060 * level, -0.45 + 0.9 * step / max(1, steps - 1))
        if bar % 4 == 2 and bar not in {22}:
            phrase = phrase_a if (bar // 4) % 2 == 0 else phrase_b
            play_melody(left, right, start, beat, phrase, "flute", 0.066 * level, 0.22)
            if section == 2:
                # Oboe answers a sixth below during the fullest section.
                counter = [(o + 0.5, h, m - 9) for o, h, m in phrase[:5]]
                play_melody(left, right, start, beat, counter, "oboe", 0.034 * level, -0.28)
        if section >= 1:
            add_drum(left, right, start, 0.052 * level, "tom", -0.10)
            for step in range(4):
                add_drum(left, right, start + (step + 0.5) * beat, 0.016 * level, "shaker", 0.36 if step % 2 else -0.36)
        if bar in {6, 12, 18}:
            add_drum(left, right, start, 0.050, "cymbal", 0.18)
        if bar == 23:
            # Final cadence: harp flourish into a held tonic with celesta halo.
            add_harp_chord(left, right, start, [48, 55, 60, 64, 67, 72], 0.055, 2.6, stagger=0.06)
            for i, note in enumerate([84, 88, 91]):
                add_bell(left, right, start + 1.4 + i * 0.22, 2.2, note, 0.030, -0.3 + i * 0.3, "celesta")
    for bar in (5, 11, 17, 23):
        chord = chords[bar % 8]
        add_bell(left, right, bar * 4 * beat + 3.0 * beat, 1.6, chord[2] + 24, 0.026, 0.4, "celesta")
    finish("town-bgm.wav", left, right, 0.175, room=0.66, damp=0.38, wet=0.34, width=1.32, started=started)


def dungeon() -> None:
    """Dark-ambient stonework: drone, wind, far bells, a slow heartbeat."""
    started = time.time()
    random.seed(2202)
    beat, left, right = canvas(72, 20)
    total = 20 * 4 * beat
    roots = [38, 37, 34, 36]
    bell_cell = [62, 63, 58, 65]
    add_wind(left, right, 0.0, total, 0.050, 220.0, 780.0, 0.045)
    for bar in range(20):
        start = bar * 4 * beat
        root = roots[bar % 4]
        section = bar // 5
        level = [0.55, 0.75, 1.00, 0.68][section]
        # Two overlapping dark drones a fifth apart breathe against each other.
        add_tone(left, right, start, 4.6 * beat, root - 12, 0.120 * level, 0.0, "dark", 1.4, 1.8)
        add_tone(left, right, start, 4.5 * beat, root - 5, 0.052 * level, -0.2, "cello", 1.8, 1.9, vibrato=0.004)
        if section >= 1:
            add_chord(left, right, start, 4.4 * beat, [root + 12, root + 19, root + 24], 0.030 * level, "strings", 1.9, 1.6, 0.7)
        # Distant bells: sparse, wide, with a minor-second shadow.
        if bar % 2 == 1:
            note = bell_cell[(bar // 2) % len(bell_cell)]
            add_bell(left, right, start + 1.6 * beat, 3.2, note, 0.040 * level, 0.55 if bar % 4 == 1 else -0.55, "crystal")
            if section >= 2:
                add_bell(left, right, start + 2.9 * beat, 2.6, note + 1, 0.020 * level, -0.3, "crystal")
        if section >= 1 and bar % 4 == 2:
            for step, midi in enumerate([62, 60, 58, 61]):
                add_tone(left, right, start + step * beat, beat * 1.3, midi, 0.026 * level, 0.30, "flute", 0.5, 0.7, vibrato=0.006)
        add_drum(left, right, start, 0.085 * level, "boom")
        if section >= 2:
            add_drum(left, right, start + 2.0 * beat, 0.045 * level, "kick")
            add_drum(left, right, start + 2.42 * beat, 0.030 * level, "kick")
        if bar in {5, 10, 15}:
            add_whoosh(left, right, max(0, start - beat), beat * 1.3, 0.014, -0.75, 0.7)
    finish("dungeon-bgm.wav", left, right, 0.156, room=0.86, damp=0.30, wet=0.46, width=1.40, started=started)


def deep() -> None:
    """Mechanical undercity pulse: low ostinato, taiko, muted warnings."""
    started = time.time()
    random.seed(3303)
    beat, left, right = canvas(92, 24)
    total = 24 * 4 * beat
    chords = [[34, 41, 46, 50], [33, 40, 45, 49], [36, 43, 48, 53], [31, 38, 45, 50]]
    signal = [57, 60, 64, 63, 55, 58, 62, 65]
    add_wind(left, right, 0.0, total, 0.030, 320.0, 1100.0, 0.06)
    for bar in range(24):
        start = bar * 4 * beat
        chord = chords[bar % 4]
        section = bar // 6
        level = [0.62, 0.84, 1.08, 0.77][section]
        add_chord(left, right, start, 4.3 * beat, chord, 0.048 * level, "strings", 0.6, 0.9)
        add_tone(left, right, start, 4.0 * beat, chord[0] - 12, 0.130 * level, -0.05, "dark", 0.08, 0.6)
        pattern = [0, 3, 1, 3, 2, 0, 3, 1]
        for step, chord_index in enumerate(pattern):
            note = chord[chord_index] + 12 + (1 if step in {3, 7} and section >= 2 else 0)
            add_tone(left, right, start + step * beat / 2, beat * 0.30, note, 0.042 * level, -0.55 if step % 2 else 0.50, "pulse", 0.004, 0.10)
            if section >= 1:
                add_drum(left, right, start + step * beat / 2, 0.016 * level, "hat", 0.46 if step % 2 else -0.46)
        add_drum(left, right, start, 0.098 * level, "boom")
        add_drum(left, right, start + 2.5 * beat, 0.062 * level, "kick")
        if section >= 2:
            add_drum(left, right, start + 1.5 * beat, 0.040 * level, "tom", 0.2)
        if bar % 4 == 3 or (section == 2 and bar % 2):
            for step in range(4):
                add_tone(left, right, start + step * beat * 0.75, beat * 0.55, signal[(bar + step) % len(signal)], 0.055 * level, 0.22, "brass", 0.035, 0.18)
        if bar % 8 == 5:
            add_bell(left, right, start + 0.5 * beat, 2.2, chord[2] + 12, 0.028 * level, -0.5, "mallet")
        if bar in {6, 12, 18}:
            add_drum(left, right, start, 0.070, "cymbal", -0.25)
    finish("deep-bgm.wav", left, right, 0.178, room=0.74, damp=0.40, wet=0.34, width=1.34, started=started)


def abyss() -> None:
    """Weighty ritual: real choir vowels, sub pulse, tolling bells, taiko."""
    started = time.time()
    random.seed(4404)
    beat, left, right = canvas(104, 24)
    total = 24 * 4 * beat
    roots = [29, 30, 26, 31, 27, 29]
    ritual = [50, 53, 57, 56, 49, 52]
    add_wind(left, right, 0.0, total, 0.026, 180.0, 620.0, 0.04)
    for bar in range(24):
        start = bar * 4 * beat
        root = roots[bar % len(roots)]
        section = bar // 6
        level = [0.56, 0.80, 1.10, 0.74][section]
        chord = [root + 12, root + 19, root + 24, root + 27]
        add_chord(left, right, start, 4.3 * beat, chord, 0.052 * level, "choir", 0.7, 1.0, 0.70)
        add_tone(left, right, start, 4.2 * beat, root - 12, 0.150 * level, 0.0, "dark", 0.14, 0.7)
        for step, pulse in enumerate([0, 0.75, 1.5, 2.5, 3.0, 3.75]):
            note = ritual[(bar + step) % len(ritual)] + (12 if step == 5 else 0)
            add_bell(left, right, start + pulse * beat, beat * 1.1, note, 0.040 * level, -0.60 + step * 0.24, "mallet")
        for pulse in [0, 1.5, 2.0, 3.5]:
            if pulse in {0, 2.0}:
                add_drum(left, right, start + pulse * beat, 0.110 * level, "boom", -0.1)
            else:
                add_drum(left, right, start + pulse * beat, 0.032 * level, "snare", 0.12)
        if bar % 6 == 0:
            add_bell(left, right, start, 4.5, root + 24, 0.055 * level, 0.0, "toll")
        if section >= 1 and bar % 2 == 0:
            for note in [root + 31, root + 34]:
                add_tone(left, right, start + 2.4 * beat, 1.5 * beat, note, 0.030 * level, (note - root - 32) / 6, "choir", 0.5, 0.7)
        if bar in {6, 12, 18}:
            add_whoosh(left, right, max(0, start - beat), 1.3 * beat, 0.022, 0.8, -0.8)
            add_drum(left, right, start, 0.070, "cymbal")
    finish("abyss-bgm.wav", left, right, 0.186, room=0.90, damp=0.26, wet=0.44, width=1.38, started=started)


def battle() -> None:
    """Orchestral action: string engine, brass stabs, timpani, heroic lead."""
    started = time.time()
    random.seed(5505)
    beat, left, right = canvas(144, 24)
    chords = [[41, 48, 53, 57], [39, 46, 51, 55], [44, 51, 56, 60], [38, 45, 50, 54]]
    hero = [
        (0.0, 0.75, 69), (0.75, 0.25, 72), (1.0, 1.0, 76), (2.0, 0.5, 75), (2.5, 0.5, 72),
        (3.0, 1.0, 77), (4.0, 1.5, 76), (5.5, 0.5, 72), (6.0, 1.0, 74), (7.0, 1.0, 69),
    ]
    run = [0, 2, 3, 5, 7, 8, 10, 12]
    for bar in range(24):
        start = bar * 4 * beat
        chord = chords[bar % 4]
        section = bar // 6
        level = [0.66, 0.90, 1.08, 0.85][section]
        for pulse in [0, 2]:
            add_chord(left, right, start + pulse * beat, 1.4 * beat, chord, 0.052 * level, "brass", 0.02, 0.14, 0.52)
        add_tone(left, right, start, 1.9 * beat, chord[0] - 12, 0.140 * level, -0.04, "bass", 0.012, 0.20)
        add_tone(left, right, start + 2 * beat, 1.9 * beat, chord[0] - 5, 0.128 * level, 0.04, "bass", 0.012, 0.20)
        # String sixteenth engine outlines the chord instead of buzzing on it.
        engine = [0, 2, 1, 2, 3, 2, 1, 2]
        for step in range(8):
            note = chord[engine[step]] + 12
            add_tone(left, right, start + step * beat / 2, beat * 0.36, note, 0.046 * level, -0.45 if step % 2 else 0.45, "strings", 0.008, 0.09)
            add_drum(left, right, start + step * beat / 2, 0.020 * level, "hat", 0.42 if step % 2 else -0.42)
        add_timpani(left, right, start, chord[0] + 12, 0.075 * level, -0.1)
        add_timpani(left, right, start + 2.0 * beat, chord[0] + 12, 0.062 * level, -0.1)
        for pulse in [1.5, 3.0]:
            add_drum(left, right, start + pulse * beat, 0.058 * level, "snare", 0.08)
        if section >= 1 and bar % 2 == 0:
            play_melody(left, right, start, beat, hero, "brass", 0.070 * level, 0.20, octave=0 if section >= 2 else -12)
            if section >= 2:
                play_melody(left, right, start, beat, hero, "strings", 0.030 * level, -0.15, octave=12)
        if bar % 6 == 5:
            # String run lifts into the next phrase.
            for step, interval in enumerate(run):
                add_tone(left, right, start + (2.0 + step * 0.25) * beat, 0.24 * beat, 53 + interval + 12, 0.040 * level, -0.3 + step * 0.08, "strings", 0.006, 0.07)
        if bar in {6, 12, 18}:
            add_drum(left, right, start, 0.075, "cymbal", 0.15)
    finish("battle-bgm.wav", left, right, 0.195, room=0.52, damp=0.48, wet=0.24, width=1.26, started=started)


def boss() -> None:
    """Boss score: low brass and choir walls, tolls, double-time percussion."""
    started = time.time()
    random.seed(6606)
    beat, left, right = canvas(160, 28)
    chords = [[29, 36, 41, 44], [28, 35, 40, 43], [26, 33, 38, 42], [31, 38, 43, 46]]
    omen = [
        (0.0, 0.5, 65), (0.5, 0.5, 68), (1.0, 1.0, 72), (2.0, 0.75, 71), (2.75, 0.25, 68),
        (3.0, 1.0, 66), (4.0, 0.5, 70), (4.5, 0.5, 73), (5.0, 1.5, 72), (6.5, 1.5, 65),
    ]
    for bar in range(28):
        start = bar * 4 * beat
        chord = chords[bar % 4]
        section = min(3, bar // 7)
        level = [0.60, 0.85, 1.12, 0.90][section]
        add_chord(left, right, start, 3.9 * beat, [c + 12 for c in chord], 0.050 * level, "choir", 0.12, 0.45, 0.66)
        add_chord(left, right, start, 1.35 * beat, chord[:3], 0.068 * level, "brass", 0.016, 0.14, 0.46)
        add_chord(left, right, start + 2 * beat, 1.35 * beat, [chord[0], chord[1], chord[3]], 0.068 * level, "brass", 0.016, 0.14, 0.46)
        add_tone(left, right, start, 3.8 * beat, chord[0] - 12, 0.160 * level, 0.0, "dark", 0.05, 0.4)
        if section >= 1:
            for step in range(8):
                add_drum(left, right, start + step * beat / 2, 0.022 * level, "hat", -0.46 if step % 2 else 0.46)
        for pulse in [0, 0.75, 1.5, 2.0, 2.75, 3.5]:
            strong = pulse in {0, 1.5, 2.0, 3.5}
            if strong:
                add_drum(left, right, start + pulse * beat, 0.120 * level, "kick")
            else:
                add_drum(left, right, start + pulse * beat, 0.062 * level, "snare", 0.1)
        add_timpani(left, right, start, chord[0] + 12, 0.070 * level, -0.12)
        if bar % 2 == 0:
            play_melody(left, right, start, beat, omen, "brass", 0.072 * level, 0.24, octave=-12 if section == 0 else 0)
        if section >= 2 and bar % 2:
            for step, note in enumerate([chord[2] + 36, chord[3] + 36, chord[2] + 31, chord[3] + 36]):
                add_tone(left, right, start + step * beat, beat * 0.85, note, 0.040 * level, -0.30 + step * 0.20, "choir", 0.08, 0.24)
        if bar in {7, 14, 21}:
            add_whoosh(left, right, max(0, start - 1.5 * beat), 1.6 * beat, 0.030, -0.9, 0.9)
            add_drum(left, right, start, 0.100, "cymbal")
            add_bell(left, right, start, 3.5, chord[0] + 24, 0.055, 0.0, "toll")
    finish("boss-bgm.wav", left, right, 0.205, room=0.60, damp=0.42, wet=0.26, width=1.30, started=started)


def tension(stage: int) -> None:
    """Five-step threat score used when out-of-depth enemies are present.

    All five cues share a small chromatic warning cell so switching intensity
    reads as the same danger growing closer.  Stage one is nearly pure dark
    ambience; each step adds tempo, subdivision, percussion, harmonic
    friction, sub weight and orchestration.  The final quarter thins just
    enough to make the loop back to its opening feel like another breath.
    """
    if stage not in range(1, 6):
        raise ValueError("tension stage must be between 1 and 5")

    started = time.time()
    random.seed(7100 + stage * 137)
    bpms = (82, 96, 112, 132, 154)
    bar_counts = (16, 16, 20, 20, 24)
    target_rms = (0.150, 0.162, 0.174, 0.186, 0.198)
    rooms = (0.88, 0.78, 0.66, 0.56, 0.48)
    wets = (0.46, 0.40, 0.32, 0.26, 0.22)
    widths = (1.40, 1.38, 1.34, 1.30, 1.28)
    beat, left, right = canvas(bpms[stage - 1], bar_counts[stage - 1])
    bars = bar_counts[stage - 1]

    if stage <= 3:
        add_wind(left, right, 0.0, bars * 4 * beat, 0.052 - 0.012 * stage, 200.0, 700.0 + 160.0 * stage, 0.05)

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
    ostinato_gain = (0.033, 0.038, 0.043, 0.048, 0.052)[stage - 1]

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
        pad_gain = (0.044, 0.046, 0.048, 0.048, 0.046)[stage - 1] * level
        add_chord(left, right, start, 4.25 * beat, harmony, pad_gain, pad_voice, 0.55, 0.85, 0.72)
        if stage >= 4:
            # A close, darker layer keeps the upper choir from making late
            # stages feel merely grand instead of dangerous.
            add_chord(left, right, start, 4.08 * beat, [root + 12, root + 18, root + 25], 0.024 * level, "dark", 0.22, 0.5, 0.48)

        # One sustained bass voice at stage one grows into a pulsing two-octave
        # engine.  Keeping a stable centre preserves impact on phone speakers.
        add_tone(
            left,
            right,
            start,
            4.08 * beat,
            root - 12,
            (0.100 + stage * 0.012) * level,
            0.0,
            "dark" if stage <= 2 else "bass",
            0.045 if stage >= 3 else 0.12,
            0.42,
        )
        if stage >= 3:
            low_pulses = 2 if stage == 3 else 4 if stage == 4 else 8
            for pulse in range(low_pulses):
                add_tone(
                    left,
                    right,
                    start + pulse * 4 * beat / low_pulses,
                    0.40 * beat,
                    root + (0 if pulse % 4 else 12),
                    (0.030 + 0.005 * stage) * level,
                    0.0,
                    "pulse",
                    0.004,
                    0.09,
                )

        # The warning ostinato evolves from four lonely bell signals into a
        # continuous double-time machine.  Accents keep the motif readable at
        # high density instead of letting it blur into a buzz.
        for step in range(subdivisions):
            ratio = step / subdivisions
            cell_index = (step + bar * (stage + 1)) % len(warning_cell)
            interval = warning_cell[cell_index]
            if stage <= 2 and interval in {1, 6} and section == 0:
                interval = 0 if interval == 1 else 5
            note = root + 12 + interval + (12 if stage == 5 and step in {7, 15} else 0)
            accent = 1.30 if step % max(1, subdivisions // 4) == 0 else 0.80
            pan = (-0.60 if step % 2 else 0.60) * (0.65 + 0.07 * stage)
            when = start + ratio * 4 * beat
            if stage == 1:
                add_bell(left, right, when, 1.6 * beat, note + 12, ostinato_gain * accent * level, pan, "crystal")
            else:
                add_tone(
                    left,
                    right,
                    when,
                    (2.28 / subdivisions) * beat,
                    note,
                    ostinato_gain * accent * level,
                    pan,
                    "pulse" if stage <= 3 else "saw",
                    0.003,
                    0.075 if stage >= 4 else 0.13,
                )

        # Percussion density rises monotonically.  Stage one is a distant
        # heartbeat; stage five interlocks sixteenth hats, kicks and snares.
        if stage == 1:
            if bar % 2 == 0:
                add_drum(left, right, start, 0.080 * level, "boom")
            if section >= 2:
                add_drum(left, right, start + 2.5 * beat, 0.036 * level, "kick")
                add_drum(left, right, start + 2.92 * beat, 0.024 * level, "kick")
        elif stage == 2:
            for pulse, kind in [(0, "boom"), (2.5, "kick")]:
                add_drum(left, right, start + pulse * beat, (0.088 if kind == "boom" else 0.052) * level, kind)
            if section >= 1:
                for pulse in (0.5, 1.5, 2.5, 3.5):
                    add_drum(left, right, start + pulse * beat, 0.013 * level, "shaker", 0.35 if pulse % 2 else -0.35)
        elif stage == 3:
            for pulse, kind in [(0, "kick"), (1.5, "snare"), (2.5, "kick"), (3.25, "tom")]:
                add_drum(left, right, start + pulse * beat, (0.085 if kind == "kick" else 0.042) * level, kind)
            for pulse in range(8):
                add_drum(left, right, start + pulse * beat / 2, 0.015 * level, "hat", -0.42 if pulse % 2 else 0.42)
        elif stage == 4:
            for pulse, kind in [(0, "kick"), (0.75, "tom"), (1.5, "snare"), (2, "kick"), (2.75, "tom"), (3.5, "snare")]:
                add_drum(left, right, start + pulse * beat, (0.098 if kind == "kick" else 0.050) * level, kind)
            for pulse in range(12):
                add_drum(left, right, start + pulse * beat / 3, 0.016 * level, "hat", -0.48 if pulse % 2 else 0.48)
        else:
            for pulse in range(8):
                kind = "kick" if pulse % 2 == 0 else "snare"
                gain = 0.108 if kind == "kick" else 0.055
                add_drum(left, right, start + pulse * beat / 2, gain * level, kind, -0.08 if kind == "kick" else 0.10)
            for pulse in range(16):
                add_drum(left, right, start + pulse * beat / 4, 0.017 * level, "hat", -0.52 if pulse % 2 else 0.52)
            if section >= 1:
                add_drum(left, right, start + 3.75 * beat, 0.024 * level, "openhat", 0.42)

        # Warning calls expand from a barely audible two-note answer into a
        # full brass/choir statement.  This gives each quarter a real musical
        # development rather than relying on loudness alone.
        if section >= 1 and bar % 2 == 0:
            call_length = min(8, 2 + stage + section)
            lead_voice = "oboe" if stage == 1 else "brass" if stage <= 4 else "choir"
            for step in range(call_length):
                interval = warning_cell[step]
                when = start + (step * 4 / call_length) * beat
                add_tone(
                    left,
                    right,
                    when,
                    (2.45 / call_length) * beat,
                    root + 24 + interval,
                    (0.030 + stage * 0.006) * level,
                    0.20,
                    lead_voice,
                    0.012 if stage >= 3 else 0.05,
                    0.12,
                )

        # Section punctuation remains intentionally below the main transients;
        # it marks escalation without making every loop sound like a boss win.
        section_size = bars // 4
        if bar in {section_size, section_size * 2, section_size * 3}:
            add_whoosh(left, right, max(0, start - 1.15 * beat), 1.20 * beat, 0.009 + stage * 0.004, -0.78, 0.78)
            add_drum(left, right, start, (0.040 + stage * 0.009) * level, "cymbal", 0.18)
            if stage >= 4:
                add_drum(left, right, start, 0.055 * level, "boom")
        if stage >= 4 and bar == section_size * 2:
            add_bell(left, right, start, 3.0, root + 24, 0.050 * level, 0.0, "toll")

    finish(
        f"tension-{stage}-bgm.wav",
        left,
        right,
        target_rms[stage - 1],
        room=rooms[stage - 1],
        damp=0.36,
        wet=wets[stage - 1],
        width=widths[stage - 1],
        density_makeup=True,
        started=started,
    )


CUES = {
    "town": town,
    "dungeon": dungeon,
    "deep": deep,
    "abyss": abyss,
    "battle": battle,
    "boss": boss,
    "tension-1": lambda: tension(1),
    "tension-2": lambda: tension(2),
    "tension-3": lambda: tension(3),
    "tension-4": lambda: tension(4),
    "tension-5": lambda: tension(5),
}


def main() -> None:
    parser = argparse.ArgumentParser(description="Render the game's procedural loop music.")
    parser.add_argument(
        "--tension-only",
        action="store_true",
        help="render only tension-1 through tension-5, preserving the six core WAV files",
    )
    parser.add_argument(
        "--only",
        choices=sorted(CUES),
        help="render a single cue for fast iteration",
    )
    args = parser.parse_args()
    ROOT.mkdir(parents=True, exist_ok=True)
    if args.only:
        CUES[args.only]()
        return
    names = [name for name in CUES if name.startswith("tension-")] if args.tension_only else list(CUES)
    for name in names:
        CUES[name]()


if __name__ == "__main__":
    main()
