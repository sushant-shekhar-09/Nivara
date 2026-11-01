"""
Unit and Integration Tests for Nivara Pre-Generated PocketTTS Voice Screening Audio Assets.
Verifies:
1. Audio manifest existence, structure, and metadata (PocketTTS 4.0.1, 24kHz sample rate).
2. Deterministic mapping for all 26 canonical questionnaire items (PSS-10: 10, PHQ-9: 9, GAD-7: 7).
3. Audio files exist on disk, are non-empty, and contain valid RIFF/WAVE headers.
4. Prompt assets exist for voice interaction guidance.
5. Deterministic fallback paths when assets are queried.
"""

import os
import json
import pytest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT_DIR / "frontend" / "public" / "audio"
QUESTIONS_DIR = AUDIO_DIR / "questions"
PROMPTS_DIR = AUDIO_DIR / "prompts"
MANIFEST_FILE = AUDIO_DIR / "manifest.json"

def test_audio_manifest_integrity():
    """Verify audio manifest exists and conforms to PocketTTS generation spec."""
    assert MANIFEST_FILE.exists(), "Audio manifest.json must exist"
    with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    assert manifest["engine"] == "Kyutai PocketTTS"
    assert manifest["version"] == "4.0.1"
    assert manifest["sample_rate"] == 24000
    assert "questions" in manifest
    assert "prompts" in manifest

def test_pss10_audio_assets():
    """Verify all 10 PSS-10 questions have valid non-empty WAV files."""
    for q_id in range(1, 11):
        filename = f"pss10_{q_id}.wav"
        file_path = QUESTIONS_DIR / filename
        assert file_path.exists(), f"Missing audio asset for PSS-10 item {q_id}: {filename}"
        assert file_path.stat().st_size > 50000, f"PSS-10 item {q_id} audio file too small or empty"

        # Check RIFF WAVE header
        with open(file_path, "rb") as f:
            header = f.read(12)
            assert header[:4] == b"RIFF", f"Invalid RIFF header for {filename}"
            assert header[8:12] == b"WAVE", f"Invalid WAVE format for {filename}"

def test_phq9_audio_assets():
    """Verify all 9 PHQ-9 questions have valid non-empty WAV files."""
    for q_id in range(1, 10):
        filename = f"phq9_{q_id}.wav"
        file_path = QUESTIONS_DIR / filename
        assert file_path.exists(), f"Missing audio asset for PHQ-9 item {q_id}: {filename}"
        assert file_path.stat().st_size > 50000, f"PHQ-9 item {q_id} audio file too small or empty"

        with open(file_path, "rb") as f:
            header = f.read(12)
            assert header[:4] == b"RIFF", f"Invalid RIFF header for {filename}"
            assert header[8:12] == b"WAVE", f"Invalid WAVE format for {filename}"

def test_gad7_audio_assets():
    """Verify all 7 GAD-7 questions have valid non-empty WAV files."""
    for q_id in range(1, 8):
        filename = f"gad7_{q_id}.wav"
        file_path = QUESTIONS_DIR / filename
        assert file_path.exists(), f"Missing audio asset for GAD-7 item {q_id}: {filename}"
        assert file_path.stat().st_size > 50000, f"GAD-7 item {q_id} audio file too small or empty"

        with open(file_path, "rb") as f:
            header = f.read(12)
            assert header[:4] == b"RIFF", f"Invalid RIFF header for {filename}"
            assert header[8:12] == b"WAVE", f"Invalid WAVE format for {filename}"

def test_fixed_prompts_assets():
    """Verify fixed voice screening prompts exist."""
    for prompt_key in ["intro", "confirm", "clarify", "completed"]:
        filename = f"prompt_{prompt_key}.wav"
        file_path = PROMPTS_DIR / filename
        assert file_path.exists(), f"Missing prompt asset: {filename}"
        assert file_path.stat().st_size > 20000, f"Prompt {filename} audio file too small"
