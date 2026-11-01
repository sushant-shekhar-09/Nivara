# DIAGNOSTIC REPORT: NIVARA LAUNCH FILM V1
*Phase 1 Audit & Creative Assessment*
*Project: Nivara AI — Mental Health Screening Platform*

---

## 1. Visual Weaknesses of V1

1. **Monotonous Motion & Lack of Dynamic Shot Sizing:**
   - V1 is structured as a vertical stack of scenes (`y = 0`, `y = 700`, `y = 1350`, `y = 2050`, etc.) where the camera simply translates along the Y-axis.
   - Every transition follows an identical formula: elements scale up (`0.85 -> 1.0`) with `easeOutBack`, wait, and then translate up with `easeInOutCubic`.
   - There are no dramatic typography close-ups, macro UI details, angled perspective shifts, or fluid match cuts.

2. **Generic Center-Weighted Card Layout:**
   - Every scene features a large, rectangular centered card (`840x480` or `860x500`).
   - This creates a "slide deck" aesthetic rather than a cinematic product film. The viewer anticipates the next centered card rather than being pulled into an unfolding story.

3. **Passive Screen Representations:**
   - While the survey card displays genuine questions, the interaction is limited to a single static circle cursor gliding to one radio button.
   - The conversational voice assistant (which is one of Nivara's strongest differentiating modalities) was only represented by an emoji circle rather than real waveform interactions or speech visualizations.

4. **Under-utilized Negative Space & Contrast:**
   - Although the color palette shifted to authentic Japandi tones (Ivory, Cream, Sage, Earth), the lighting remained flat.
   - There is a lack of localized depth: soft directional rim lighting, subtle drop-off, depth-of-field focus shifts, and tactile micro-textures that give physical presence to digital cards.

---

## 2. Audio Problems of V1

1. **Mechanical Voice Synthesis:**
   - `voiceover.wav` was generated using SAPI5 / Windows offline TTS (Zira Desktop voice).
   - The delivery lacks natural human cadence, emotional variation, breath support, and conversational warmth. Sentence endings sound robotic and uniform.

2. **Synthetic Soundscape Weakness:**
   - `soundscape.wav` was procedurally synthesized using basic sine waves and exponential decay functions.
   - The result sounds like a rudimentary tone generator rather than an evocative, cinematic soundtrack with depth, warmth, organic instrumentation, and dynamic tension.

3. **Crude Audio Ducking & Missing SFX Layers:**
   - Mixing via a single basic FFmpeg `amix` with blanket volume attenuation resulted in muddy audio without true sidechain compression or dynamic EQ separation.
   - Transition sound effects (risers, whooshes, haptic taps, reveal accents) were synthesized purely as tonal bursts rather than tactile, acoustic Foley.

---

## 3. Export Issues of V1

1. **Static Placeholder MP4 Master:**
   - The existing `Nivara_Launch_Film_16x9.mp4` in the project root was compiled by looping `launch_thumbnail.png` over `master_soundtrack.mp3` with `-loop 1 -tune stillimage`. It is not an animation render.
   - The Motion Canvas in-browser preview was never rendered out to actual animated frame sequences on disk.

2. **Vite File-System Serving Allow-List Warning:**
   - When Motion Canvas was served, Vite blocked cross-directory styles from the junctioned `node_modules` until explicitly permitted in `server.fs.allow`.

3. **No Headless Video Export Pipeline:**
   - Motion Canvas lacks an out-of-the-box headless CLI export command. The previous workflow relied exclusively on manual user interaction in the web UI.
   - A deterministic, scriptable export workflow (driving headless browser capture or headless Canvas frame rendering piped to FFmpeg) must be established so that verified 1080p MP4s can be produced reliably without manual browser clicking.

---

## 4. Verified Features Approved for Portrayal

Based on the source code audit of `D:\Projects\Mental Health Assistance ML-Project`:

| Feature | Implementation Source | Approved Film Representation |
| :--- | :--- | :--- |
| **Conversational Voice Assistant** | `frontend/src/pages/AssistantPage.tsx` | Voice waveforms, empathetic listening, conversational prompts. |
| **Standardized Check-In (PSS-10 / PHQ-9 / GAD-7)** | `frontend/src/pages/ScreeningPage.tsx` | Tactile survey card, responsive radio selections, progress indicator. |
| **Explainable AI (TreeSHAP Attributions)** | `frontend/src/components/results/SHAPChart.tsx` | Directional attribution bars (Shifted Higher vs Shifted Lower) with statistical disclaimer. |
| **Calibrated Screening Tiers** | `frontend/src/components/results/RiskBand.tsx` | Tuned threshold screening bands (Low / Moderate / Elevated). |
| **Deterministic Crisis Sanctuary** | `frontend/src/components/crisis/CrisisContacts.tsx` | Ethical boundary: PHQ-9 Item 9 > 0 triggers instant bypass to verified helplines (Tele-MANAS, 112). |
| **Institutional Governance ($k \ge 5$)** | `frontend/src/components/analytics/SuppressionNotice.tsx` | Aggregate cohort metrics with privacy suppression of clusters under 5 students. |

---

## 5. Overhaul Action Plan

1. **Milestone 1 — Audio Production:**
   - Produce 3 distinct voiceover takes with natural human cadence, emotional inflection, and warmth.
   - Compose a dynamic organic soundtrack with tension build, silence drop, and warm harmonic reveal.
   - Master at 48kHz stereo with proper voice-music ducking.

2. **Milestone 2 — Opening 10 Seconds:**
   - Implement "Some things are hard to put into words."
   - Kinetic, asymmetric typographic event + chaotic pressure fragments + sudden quiet drop ➔ organic wave convergence into the Nivara botanical emblem.
   - Render standalone 10s video and contact sheet.

3. **Milestone 3 — Product Choreography & Complete Master:**
   - Fluid continuous motion into real UI close-ups (voice waveforms, tactile survey check-in, TreeSHAP waterfall, institutional privacy shield).
   - Final brand signature and CTA: "Nivara. Start with a check-in. Discover Nivara."
   - Headless deterministic frame rendering to 1080p MP4 master.
