# Nivara Launch Film V2 — Voiceover & Sound Design Specification

**Runtime:** 45.00 seconds  
**Voice Actor / Model:** Amy (`en_US-amy-medium`, Piper Neural ONNX)  
**Sample Rate:** 48,000 Hz Stereo (24-bit PCM / 320 kbps AAC)  
**Target Integrated Loudness:** -14.8 LUFS (EBU R128 Compliant)  
**True Peak Ceiling:** -1.0 dBTP  

---

## 1. Dialogue Script & Timed Anchors

| Timecode | Visual Shot | Narration Script | Musical & SFX Cues |
| :--- | :--- | :--- | :--- |
| **00:00.30 – 00:03.20** | **Shot 1: The Hook** | *"Some things are hard to put into words."* | Low Eb Major cello & atmospheric pad. Golden acoustic ember pulse. |
| **00:03.20 – 00:07.20** | **Shot 2: The Tension** | *(Atmospheric build - no speech)* | Percussive acoustic riser; tension cards snap into view. |
| **00:07.20 – 00:08.80** | **Shot 3A: The Silence Drop** | *(Absolute soundtrack silence)* | Complete drop at 07.4s. Cards implode into golden/sage soundwave. |
| **00:08.80 – 00:11.50** | **Shot 3B: The Signature Reveal** | *(Chime & bloom - no speech)* | Bright glass chime + warm sub-bass hit at 08.8s. Nivara mark blooms into warm Ivory. |
| **00:11.50 – 00:18.00** | **Shot 4: Meet Nivara** | *"Meet Nivara. A more private way to begin a student well-being check-in."* | Gentle marimba rhythm (100 BPM) and Fender Rhodes chord progression. |
| **00:18.00 – 00:25.50** | **Shot 5: Dual Check-in Modes** | *"Talk it through. Or take it one question at a time."* | Haptic radio click at 20.8s as Question 3 is selected with subtle tactile ring. |
| **00:25.50 – 00:33.50** | **Shot 6: TreeSHAP Explainability** | *"With honest clarity, so you see what shaped the result."* | TreeSHAP calculation chime at 27.2s; feature waterfall bars expand. |
| **00:33.50 – 00:39.50** | **Shot 7: Privacy & Governance** | *"Safe by design. Minimum-group thresholds keep student identities protected."* | Deep reassurance chord; privacy lock tone at 34.0s for $k \ge 5$ shield. |
| **00:39.50 – 00:45.00** | **Shot 8: Brand Signature Close** | *"A quieter first step toward student well-being. Discover Nivara."* | Musical cadence resolves in Eb Major with natural acoustic reverb decay to 45.0s. |

---

## 2. Audio Stem Directory Structure

All audio assets are preserved in lossless 48kHz PCM and web-optimized 320kbps MP3:

```
src/audio/
├── master_voiceover.wav      # Amy neural voiceover stem (48kHz, dual-mono)
├── master_music.wav          # Eb Major procedural soundtrack stem (48kHz stereo)
├── master_sfx.wav            # Haptic, chime, riser, and click sound design stem
├── master_preview_48k.wav    # Master mixed & leveled soundtrack (-14.8 LUFS, -1.0 dBTP)
└── master_soundtrack.mp3     # Motion Canvas web preview soundtrack (320 kbps)
```
