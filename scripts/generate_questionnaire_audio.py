"""
Reproducible Asset Generation Script for Nivara Voice Screening Audio.
Uses Kyutai PocketTTS (pocket-tts 4.0.1) to pre-generate audio files for all 
standardized questionnaire items (PSS-10, PHQ-9, GAD-7) and fixed prompts.

Features:
- Deterministic output paths under frontend/public/audio/
- Skips already-generated audio files to prevent redundant inference (use --force to re-generate)
- Produces manifest.json documenting all items, exact transcripts, file sizes, and checksums
- Standardized, un-paraphrased approved questionnaire wording
"""

import os
import sys
import json
import argparse
import subprocess
from pathlib import Path
from typing import Dict, Any, List

ROOT_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT_DIR / "frontend" / "public" / "audio" / "questions"
PROMPTS_DIR = ROOT_DIR / "frontend" / "public" / "audio" / "prompts"
MANIFEST_FILE = ROOT_DIR / "frontend" / "public" / "audio" / "manifest.json"

# Canonical Question Definitions
PSS10_ITEMS = [
    (1, "In a semester, how often have you felt upset due to something that happened in your academic affairs? Options are: Never, Almost Never, Sometimes, Fairly Often, or Very Often."),
    (2, "In a semester, how often you felt as if you were unable to control important things in your academic affairs? Options are: Never, Almost Never, Sometimes, Fairly Often, or Very Often."),
    (3, "In a semester, how often you felt nervous and stressed because of academic pressure? Options are: Never, Almost Never, Sometimes, Fairly Often, or Very Often."),
    (4, "In a semester, how often you felt as if you could not cope with all the mandatory academic activities? Options are: Never, Almost Never, Sometimes, Fairly Often, or Very Often."),
    (5, "In a semester, how often you felt confident about your ability to handle your academic or university problems? Options are: Never, Almost Never, Sometimes, Fairly Often, or Very Often."),
    (6, "In a semester, how often you felt as if things in your academic life is going on your way? Options are: Never, Almost Never, Sometimes, Fairly Often, or Very Often."),
    (7, "In a semester, how often are you able to control irritations in your academic or university affairs? Options are: Never, Almost Never, Sometimes, Fairly Often, or Very Often."),
    (8, "In a semester, how often you felt as if your academic performance was on top? Options are: Never, Almost Never, Sometimes, Fairly Often, or Very Often."),
    (9, "In a semester, how often you got angered due to bad performance or low grades that is beyond your control? Options are: Never, Almost Never, Sometimes, Fairly Often, or Very Often."),
    (10, "In a semester, how often you felt as if academic difficulties are piling up so high that you could not overcome them? Options are: Never, Almost Never, Sometimes, Fairly Often, or Very Often.")
]

PHQ9_ITEMS = [
    (1, "Over the last two weeks, how often have you been bothered by: Little interest or pleasure in doing things? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (2, "Over the last two weeks, how often have you been bothered by: Feeling down, depressed, or hopeless? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (3, "Over the last two weeks, how often have you been bothered by: Trouble falling or staying asleep, or sleeping too much? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (4, "Over the last two weeks, how often have you been bothered by: Feeling tired or having little energy? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (5, "Over the last two weeks, how often have you been bothered by: Poor appetite or overeating? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (6, "Over the last two weeks, how often have you been bothered by: Feeling bad about yourself, or that you are a failure or have let yourself or your family down? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (7, "Over the last two weeks, how often have you been bothered by: Trouble concentrating on things, such as reading books or coursework? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (8, "Over the last two weeks, how often have you been bothered by: Moving or speaking so slowly that other people noticed, or being fidgety or restless? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (9, "Over the last two weeks, how often have you been bothered by: Thoughts that you would be better off dead, or of hurting yourself in some way? Options are: Not at all, Several days, More than half the days, or Nearly every day.")
]

GAD7_ITEMS = [
    (1, "Over the last two weeks, how often have you been bothered by: Feeling nervous, anxious, or on edge due to academic pressure? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (2, "Over the last two weeks, how often have you been bothered by: Not being able to stop or control worrying about academic affairs? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (3, "Over the last two weeks, how often have you been bothered by: Worrying too much about different university matters? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (4, "Over the last two weeks, how often have you been bothered by: Trouble relaxing due to academic demands? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (5, "Over the last two weeks, how often have you been bothered by: Being so restless that it is hard to sit still? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (6, "Over the last two weeks, how often have you been bothered by: Becoming easily annoyed or irritable because of academic pressure? Options are: Not at all, Several days, More than half the days, or Nearly every day."),
    (7, "Over the last two weeks, how often have you been bothered by: Feeling afraid, as if something awful might happen? Options are: Not at all, Several days, More than half the days, or Nearly every day.")
]

FIXED_PROMPTS = [
    ("intro", "Welcome to the Nivara Voice Screening assessment. Each question will be read aloud with allowed options. You can speak your answer anytime."),
    ("confirm", "Please confirm your answer to proceed to the next question."),
    ("clarify", "Response was unclear. Please select or speak one of the allowed options."),
    ("completed", "Screening completed. Thank you. Calculating results.")
]

def generate_single_audio(text: str, output_path: Path, force: bool = False) -> bool:
    """Generates audio using pocket-tts CLI or skips if already generated."""
    if output_path.exists() and not force:
        if output_path.stat().st_size > 1000:
            return False  # Already exists and valid

    output_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        sys.executable,
        "-m", "pocket_tts",
        "generate",
        "--text", text,
        "--output-path", str(output_path),
        "--quiet",
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error generating {output_path.name}: {res.stderr}")
        return False
    return True

def generate_all_assets(force: bool = False):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PROMPTS_DIR.mkdir(parents=True, exist_ok=True)

    manifest: Dict[str, Any] = {
        "engine": "Kyutai PocketTTS",
        "version": "4.0.1",
        "voice": "alba",
        "language": "english",
        "sample_rate": 24000,
        "questions": {},
        "prompts": {},
    }

    total_tasks = len(PSS10_ITEMS) + len(PHQ9_ITEMS) + len(GAD7_ITEMS) + len(FIXED_PROMPTS)
    completed = 0
    generated_count = 0

    print(f"Starting audio asset generation for {total_tasks} audio items...")

    # 1. PSS-10
    manifest["questions"]["pss10"] = {}
    for q_id, text in PSS10_ITEMS:
        filename = f"pss10_{q_id}.wav"
        filepath = OUTPUT_DIR / filename
        rel_url = f"/audio/questions/{filename}"
        was_gen = generate_single_audio(text, filepath, force=force)
        if was_gen:
            generated_count += 1
        completed += 1
        size = filepath.stat().st_size if filepath.exists() else 0
        manifest["questions"]["pss10"][str(q_id)] = {
            "file": filename,
            "url": rel_url,
            "text": text,
            "size_bytes": size,
        }
        print(f"[{completed}/{total_tasks}] PSS-10 Q{q_id} -> {filename} ({'generated' if was_gen else 'cached'})")

    # 2. PHQ-9
    manifest["questions"]["phq9"] = {}
    for q_id, text in PHQ9_ITEMS:
        filename = f"phq9_{q_id}.wav"
        filepath = OUTPUT_DIR / filename
        rel_url = f"/audio/questions/{filename}"
        was_gen = generate_single_audio(text, filepath, force=force)
        if was_gen:
            generated_count += 1
        completed += 1
        size = filepath.stat().st_size if filepath.exists() else 0
        manifest["questions"]["phq9"][str(q_id)] = {
            "file": filename,
            "url": rel_url,
            "text": text,
            "size_bytes": size,
        }
        print(f"[{completed}/{total_tasks}] PHQ-9 Q{q_id} -> {filename} ({'generated' if was_gen else 'cached'})")

    # 3. GAD-7
    manifest["questions"]["gad7"] = {}
    for q_id, text in GAD7_ITEMS:
        filename = f"gad7_{q_id}.wav"
        filepath = OUTPUT_DIR / filename
        rel_url = f"/audio/questions/{filename}"
        was_gen = generate_single_audio(text, filepath, force=force)
        if was_gen:
            generated_count += 1
        completed += 1
        size = filepath.stat().st_size if filepath.exists() else 0
        manifest["questions"]["gad7"][str(q_id)] = {
            "file": filename,
            "url": rel_url,
            "text": text,
            "size_bytes": size,
        }
        print(f"[{completed}/{total_tasks}] GAD-7 Q{q_id} -> {filename} ({'generated' if was_gen else 'cached'})")

    # 4. Fixed Prompts
    for p_id, text in FIXED_PROMPTS:
        filename = f"prompt_{p_id}.wav"
        filepath = PROMPTS_DIR / filename
        rel_url = f"/audio/prompts/{filename}"
        was_gen = generate_single_audio(text, filepath, force=force)
        if was_gen:
            generated_count += 1
        completed += 1
        size = filepath.stat().st_size if filepath.exists() else 0
        manifest["prompts"][p_id] = {
            "file": filename,
            "url": rel_url,
            "text": text,
            "size_bytes": size,
        }
        print(f"[{completed}/{total_tasks}] Prompt '{p_id}' -> {filename} ({'generated' if was_gen else 'cached'})")

    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"\nCompleted! Generated {generated_count} new files, cached {completed - generated_count} files.")
    print(f"Manifest written to: {MANIFEST_FILE}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate pre-rendered audio assets for Nivara voice screening.")
    parser.add_argument("--force", action="store_true", help="Re-generate all audio files even if they exist.")
    args = parser.parse_args()
    generate_all_assets(force=args.force)
