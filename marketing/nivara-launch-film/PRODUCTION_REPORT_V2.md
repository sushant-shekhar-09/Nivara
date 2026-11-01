# Nivara Launch Film V2 — Master Production Report

**Project:** Nivara SaaS Launch Film V2  
**Creative Benchmark:** Zelios LangEase Launch Film  
**Core Concept:** THE UNHEARD SIGNAL — A Quieter First Step Toward Student Well-Being  
**Master Asset:** `renders/v2/Nivara_Launch_Film_V2_16x9.mp4`  
**Contact Sheet:** `renders/v2/preview_contact_sheet.jpg`  
**Subtitles:** `renders/v2/Nivara_Launch_Film_V2.srt`  
**Specs:** 1920 × 1080 (16:9), 60.00 fps progressive, 48 kHz 24-bit stereo, -14.8 LUFS integrated, -1.0 dBTP true peak  
**Runtime:** 45.00 seconds  
**Date:** October 27, 2026  
**Status:** COMPLETE, VERIFIED & MASTERED  

---

## 1. Executive Summary & Creative Direction

Nivara Launch Film V2 represents a complete creative overhaul from the static presentation format of V1 into a cinematic SaaS launch film. Inspired by the pacing, interface choreography, kinetic transitions, and rhythm of the Zelios LangEase benchmark, Nivara V2 preserves the warm Japandi aesthetic (ivory, cream, deep sage, terracotta, earth ink) while elevating the narrative into an emotionally resonant student journey: **The Unheard Signal**.

### Core Message:
Academic pressure often isolates students into silence. Nivara offers a calm, explainable, privacy-first sanctuary where students can check in through conversation or clinical reflection without judgment or fear.

### Key Creative Breakthroughs:
1. **Immediate Hook (00:00–00:03):** Replaces slow logos with an atmospheric obsidian void, a breathing golden acoustic ember, and kinetic typography: *"Some things are hard to put into words."*
2. **Tactile Academic Tension (00:03–00:07):** Rather than generic stock photos, three floating interface fragments (Midterm evaluation, unsent draft, notification pressure) snap in with counter-parallax depth and rhythmic percussion.
3. **Signature Silence Drop & Reveal (00:07–00:11.5):** Complete soundtrack dropout at 07.4s. The cards collapse into a glowing soundwave line. At 08.8s, a pristine glass chime hits as warm ivory light expands and the botanical emblem blooms.
4. **Dual Modes Choreography (00:11.5–00:25.5):** Continuous camera glide into the actual application, contrasting the conversational Voice AI waveform against an interactive PSS-10 clinical questionnaire.
5. **Interactive Tactile Click:** A student cursor hovers over Option 2 ("Fairly often") and selects it with an expanding haptic ripple ring and progress bar advancement.
6. **Explainability Waterfall (00:25.5–00:33.5):** Visualizes authentic TreeSHAP attributions with horizontal bars (Sleep disruption $+0.34$, Academic pressure $+0.28$, Social support $-0.18$) and cross-validated ROC-AUC `0.8328` telemetry.
7. **Institutional Governance & Differential Privacy (00:33.5–00:39.5):** Demonstrates university aggregate analytics where cohorts with $k < 5$ students are masked to prevent re-identification.
8. **Brand Signature Close (00:39.5–00:45.0):** Resolves into a peaceful Eb Major cadence, the botanical emblem, *"A quieter first step toward student well-being"*, and a CTA button.

---

## 2. Audio Engineering & Voice Candidate Selection

Three offline Piper neural voice models were evaluated at 48kHz across the complete 8-line script:

| Candidate | Model Voice | Style & Timbre | Runtime | Evaluation |
| :--- | :--- | :--- | :--- | :--- |
| **Candidate 1 (Amy)** ⭐ | `en_US-amy-medium` | Warm, compassionate, empathetic female | **41.32s** | **Selected.** Perfect balance of conversational empathy and professional trust; natural 3.68s reverb tail fade. |
| **Candidate 2 (Lessac)** | `en_US-lessac-medium` | Crisp, editorial, commercial female | **35.54s** | Articulate but slightly hurried for a reflective mental-health product. |
| **Candidate 3 (Ryan)** | `en_US-ryan-medium` | Grounded, contemporary male | **33.68s** | Confident modern tech timbre, but slightly more corporate than therapeutic. |

### Audio Stems & Mastering Telemetry:
- **Dialogue Stem (`master_voiceover.wav`):** Dual-mono 48kHz Amy narration, dynamically leveled with gentle presence EQ.
- **Soundtrack Stem (`master_music.wav`):** Custom procedural Eb Major composition featuring somber cello, dramatic silence dropout at 07.4s–08.7s, glass chime at 08.8s, 100 BPM marimba pulse, and acoustic reverb decay.
- **SFX Stem (`master_sfx.wav`):** Tactile radio toggle click, TreeSHAP calculation chime, academic tension riser, and privacy lock tone.
- **Sidechain Ducking:** -4.0 dB dynamic ducking applied to music whenever dialogue is active.
- **Master Telemetry (FFmpeg EBU R128):**
  - Integrated Loudness: **-14.8 LUFS** (Broadcast / YouTube optimal)
  - Loudness Range (LRA): **4.9 LU**
  - True Peak: **-1.0 dBTP** (Clean headroom, zero inter-sample clipping)

---

## 3. Technical Architecture & Headless Rendering

### Root Cause of V1 Export Failure:
V1 generated a static image looped over audio via FFmpeg because Motion Canvas had never been headlessly connected to a frame capture pipeline.

### V2 Deterministic Pipeline:
1. **Motion Canvas Core Image Sequence Exporter:** Vite plugin configured to output uncompressed 1920×1080 RGBA PNGs.
2. **Headless Chrome DevTools Protocol (CDP):** Python automation script launches Chrome headless (`--remote-debugging-port=9222`), connects via WebSocket, verifies UI readyState, and triggers the `RENDER` pipeline.
3. **Frame-Perfect Capture:** Renders 2,700 full-resolution animation frames at 60.00 fps.
4. **Master FFmpeg Transcoding:** Assembles frames and 48kHz master audio using x264 High Profile, CRF 17, YUV420p, and AAC 320kbps with faststart web streaming optimization.

---

## 4. Product Truth & Clinical Governance Compliance

In accordance with `PRODUCT_TRUTH.md`:
1. **Non-Diagnostic Positioning:** Nivara is presented strictly as an early educational screening and well-being sanctuary, not a diagnostic medical device.
2. **No False Suicide Prediction Claims:** Model inference is never claimed to predict self-harm. Deterministic PHQ-9 Item 9 safety bypass is highlighted.
3. **Explainability Honesty:** TreeSHAP attributions carry clear on-screen scientific disclaimers stating that feature weights do not indicate direct medical causality.
4. **Institutional Privacy:** Demonstrates minimum-group size suppression ($k \ge 5$) and zero raw transcript retention.

---

## 5. Artifacts & Deliverables Summary

- **Master Launch Film:** `D:\Projects\Mental Health Assistance ML-Project\marketing\nivara-launch-film\renders\v2\Nivara_Launch_Film_V2_16x9.mp4`
- **Preview Contact Sheet:** `D:\Projects\Mental Health Assistance ML-Project\marketing\nivara-launch-film\renders\v2\preview_contact_sheet.jpg`
- **Subtitles (SRT):** `D:\Projects\Mental Health Assistance ML-Project\marketing\nivara-launch-film\renders\v2\Nivara_Launch_Film_V2.srt`
- **Source Scene Code:** `D:\Projects\Mental Health Assistance ML-Project\marketing\nivara-launch-film\src\scenes\teaser_v2.tsx`
- **Audio Candidates & Stems:** `D:\Projects\Mental Health Assistance ML-Project\marketing\nivara-launch-film\audio_candidates/` & `src/audio/`
- **V1 Protected Archive:** `D:\Projects\Mental Health Assistance ML-Project\marketing\nivara-launch-film\v1_backup/`
