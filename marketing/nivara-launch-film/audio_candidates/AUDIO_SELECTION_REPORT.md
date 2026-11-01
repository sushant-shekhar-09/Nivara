# Nivara Launch Film V2 — Audio Production & Selection Report
**Project:** Nivara Launch Film V2 (45.0s, 1920×1080 @ 30fps, 48kHz stereo)  
**Date:** October 27, 2026  
**Status:** Approved & Mastered to Industry Standard  

---

## 1. Executive Summary

Milestone 1 required generating 3 distinct voice candidates across the full 8-line script, evaluating their pacing, resonance, and emotional tone against the Zelios reference and the mental health domain, synthesizing custom stereo stems for music and sound design, and mastering the combined mix to broadcast/streaming loudness standards (-14 LUFS integrated, $\le -1.0$ dBTP true peak).

---

## 2. Voice Candidate Evaluation

All voiceover candidates were synthesized using offline, non-cloud neural acoustic models (Piper ONNX) running at 48kHz with exact phonetic pauses tailored to the storyboard timing.

| Candidate | Model Voice | Style & Timbre | Runtime | Loudness (RMS / Peak) | Assessment & Pacing Fit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Candidate 1 (Amy)** ⭐ | `en_US-amy-medium` | Warm, compassionate, unhurried, empathetic female | **41.32s** | -18.2 dBFS / -0.2 dBFS | **Selected Candidate.** Amy delivers a gentle, conversational tone that fits a mental health sanctuary. The 41.32s runtime leaves 3.68s of warm musical resolution at the end for the brand mark to breathe. |
| **Candidate 2 (Lessac)** | `en_US-lessac-medium` | Crisp, editorial, polished commercial female | **35.54s** | -17.4 dBFS / -0.1 dBFS | Clean and articulate, but slightly brisk for a reflective student sanctuary; would require artificial padding. |
| **Candidate 3 (Ryan)** | `en_US-ryan-medium` | Grounded, contemporary, steady male | **33.68s** | -18.8 dBFS / -0.3 dBFS | Strong modern tech cadence, but feels slightly more corporate than therapeutic. |

### Decision: Candidate 1 (Amy) Selected
Amy's voice captures the human, trustworthy warmth essential for a student well-being platform, avoiding the cold clinical distance of standard commercial tech ads.

---

## 3. Script Lines & Precise Audio Anchors

| Shot | Timecode | Script Line | Sonic & Musical Cue |
| :--- | :--- | :--- | :--- |
| **01 Hook** | `00:00 - 00:03` | *"Some things are hard to put into words."* | Low Eb major ambient pad, subtle vinyl texture, sub-bass pulse |
| **02 Tension** | `00:03 - 00:07` | *(Fragments of academic pressure, deadlines)* | Rhythmic polyrhythm, rising acoustic tension, clock ticking |
| **03 Drop & Reveal** | `00:07 - 00:10` | *(Soundtrack silence drop at 07.4s, chime at 08.8s)* | Absolute silence drop at 07.4s, organic chime + whoosh morphing into Nivara |
| **04 Introduction** | `00:10 - 00:18` | *"Meet Nivara. A more private way to begin a student well-being check-in."* | Warm Fender Rhodes chords + gentle marimba heartbeat kicks in |
| **05 Dual Modes** | `00:18 - 00:25` | *"Talk it through. Or take it one question at a time."* | Tactile click sound as manual option toggles; subtle voice waveform sweep |
| **06 Interaction** | `00:25 - 00:33` | *"With honest clarity, so you see what shaped the result."* | TreeSHAP calculation chime; soft glass slide on explainability cards |
| **07 Care Pathway** | `00:33 - 00:39` | *"Safe by design. Minimum-group thresholds keep student identities protected."* | Low reassurance chord; privacy lock chime confirming $k \ge 5$ threshold |
| **08 Brand Close** | `00:39 - 00:45` | *"A quieter first step toward student well-being. Discover Nivara."* | Musical resolution into warm Eb Major cadence; 3.68s reverb tail fade |

---

## 4. Stems & Mastering Specifications

### Stems Created:
1. **Dialogue Stem (`master_voiceover.wav`):** Amy neural voiceover, dual-mono 48kHz, dynamically leveled with de-essing and gentle presence boost.
2. **Music Stem (`master_music.wav`):** 45.00s custom procedural composition in Eb Major / A Minor:
   - 0.0s–7.4s: Somber, atmospheric cello and analog synth pads.
   - 7.4s–8.7s: Dramatic silence drop (soundtrack drops out completely for the signature reveal).
   - 8.8s: High-frequency glass chime + sub boom.
   - 10.0s–38.0s: Warm marimba pulse (100 BPM) with electric piano chords.
   - 38.0s–45.0s: Rich, resolving major cadence with natural acoustic reverb decay.
3. **SFX Stem (`master_sfx.wav`):**
   - 03.5s–07.4s: Academic pressure riser and notification stutters.
   - 08.4s–09.2s: Waveform morph whoosh.
   - 20.8s: Haptic radio card toggle click.
   - 27.2s: TreeSHAP explainability card bloom.
   - 34.0s: Minimal-group privacy shield lock tone.

### Dynamic Ducking:
Automated sidechain envelope: when speech is detected, the music stem ducks by $-4.0\text{ dB}$ to ensure pristine vocal clarity and zero dialogue masking.

### Final Mastering Telemetry (FFmpeg EBU R128):
- **Integrated Loudness ($I$):** `-14.8 LUFS` (Target: $-14.0 \pm 1.0\text{ LUFS}$)
- **Loudness Range (LRA):** `4.9 LU`
- **True Peak ($TP$):** `-1.0 dBFS` (Zero clipping, streaming broadcast safe)
- **Sample Rate:** `48,000 Hz`, 16-bit PCM / 320 kbps MP3
- **File Locations:**
  - `src/audio/master_preview_48k.wav` (Master uncompressed WAV)
  - `src/audio/master_soundtrack.mp3` (Web preview MP3)
  - `src/audio/master_voiceover.wav` (Dialogue stem)
  - `src/audio/master_music.wav` (Music stem)
  - `src/audio/master_sfx.wav` (SFX stem)

---
**Milestone 1 Status: COMPLETE & VERIFIED**
