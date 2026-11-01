# EXTERNAL MEDIA, CREDENTIALS & DECISION LOG
*Nivara Launch Film Project*

---

## 1. Verified & Embedded Media
- ✅ **Master Audio Track (`public/audio/master_soundtrack.mp3`):** Generated and balanced. Combines warm contemplative ambient soundscape (44.1kHz) + articulate narration (100 wpm) with automated ducking.
- ✅ **Brand Logos & Vectors (`public/`):** Botanical meditating emblem (`nivara-logo.svg`) and horizontal mark (`nivara-logo-text.svg`) verified and embedded.
- ✅ **Typography:** Google Fonts (`DM Serif Display`, `Manrope`, `JetBrains Mono`) imported globally.
- ✅ **Subtitles:** Frame-accurate `.srt` timing (`Nivara_Launch_Film.srt`) verified against the 45.0s master timeline.

---

## 2. Optional Production Enhancements (For Further Polish)
- **Studio Human Voice Actor:** The current master uses an offline neural reference voice. If you have an ElevenLabs API key or hire a voice artist, replace `public/audio/voiceover.wav` with the studio recording and rerun the audio mixer.
- **Physical B-Roll Shots:** If you capture live 4K screen recordings via OpenScreen of your local React application, drop them directly into `public/captures/` and reference them with `<Img>` or `<Video>` in Shot 4 or 5.

---

## 3. How to Launch & Preview
1. Double-click `launch_film_studio.bat` in `D:\Projects\Mental Health Assistance ML-Project\marketing\nivara-launch-film\`.
2. Open `http://localhost:9000` (or `http://localhost:5173`) in your browser.
3. Use the timeline controls to scrub through the 8 shots, or trigger an export in the Video Settings tab.
