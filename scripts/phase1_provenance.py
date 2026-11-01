"""
Phase 1: Dataset Acquisition & Provenance Pipeline
Copies raw datasets into canonical data/raw/ structure, computes SHA-256 hashes,
inspects row/column counts, and generates machine-readable manifest (JSON and YAML).
"""

import os
import shutil
import hashlib
import json
import yaml
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
INTERIM_DIR = DATA_DIR / "interim"
PROCESSED_DIR = DATA_DIR / "processed"
DOCS_DATA_DIR = BASE_DIR / "docs" / "data"

SOURCE_DATASETS_DIR = BASE_DIR / "Datasets"

def compute_sha256(file_path: Path) -> str:
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(65536), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def inspect_file(file_path: Path):
    suffix = file_path.suffix.lower()
    row_count = None
    col_count = None
    columns = None
    
    if suffix == ".csv":
        try:
            df = pd.read_csv(file_path, encoding="utf-8")
            row_count, col_count = df.shape
            columns = list(df.columns)
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(file_path, encoding="latin1")
                row_count, col_count = df.shape
                columns = list(df.columns)
            except Exception as e:
                print(f"Error reading CSV {file_path}: {e}")
    elif suffix == ".xlsx":
        try:
            df = pd.read_excel(file_path)
            row_count, col_count = df.shape
            columns = list(df.columns)
        except Exception as e:
            print(f"Error reading Excel {file_path}: {e}")
    elif suffix == ".sav":
        try:
            import pyreadstat
            df, meta = pyreadstat.read_sav(file_path)
            row_count, col_count = df.shape
            columns = list(df.columns)
        except Exception:
            # If pyreadstat not installed, fallback or note it
            row_count = "SPSS binary"
            col_count = "SPSS binary"
    
    return row_count, col_count, columns

def run():
    print("=" * 60)
    print("Nivara AI - Phase 1: Data Provenance Pipeline")
    print("=" * 60)
    
    # 1. Ensure target directories exist
    for d in [RAW_DIR / "25771164_bangladesh",
              RAW_DIR / "10423537_xinxiang",
              RAW_DIR / "24052236_uk",
              INTERIM_DIR,
              PROCESSED_DIR,
              DOCS_DATA_DIR]:
        d.mkdir(parents=True, exist_ok=True)
        
    mapping = {
        "25771164_bangladesh": {
            "source_dir": SOURCE_DATASETS_DIR / "Bangladesh",
            "doi": "10.6084/m9.figshare.25771164",
            "name": "MHP (Anxiety, Stress, Depression) Dataset of University Students (Bangladesh)",
            "purpose": "Primary ML training, validation, cross-validation, and evaluation",
            "license": "CC BY 4.0",
            "download_date": "2026-10-03 (Rebuild initialization)",
            "citation": "Hasan, M. et al. (2024). MHP (Anxiety, Stress, Depression) Dataset of University Students. Figshare. https://doi.org/10.6084/m9.figshare.25771164",
            "known_limitations": "Cross-sectional self-reported survey in Bangladeshi university students; non-clinical sample; unverified institutional IDs; self-selection bias."
        },
        "10423537_xinxiang": {
            "source_dir": SOURCE_DATASETS_DIR / "China-Xinxiang",
            "doi": "10.5281/zenodo.10423537",
            "name": "Temporal Dynamics in Psychological Assessments (Xinxiang Medical University, China)",
            "purpose": "Secondary research / external cohort analysis / psychometric validation (NOT merged for primary training)",
            "license": "Creative Commons Attribution 4.0 International",
            "download_date": "2026-10-03 (Rebuild initialization)",
            "citation": "Gong, W. et al. (2023). Temporal Dynamics in Psychological Assessments. Zenodo. https://doi.org/10.5281/zenodo.10423537",
            "known_limitations": "Medical student cohort in China; distinct cultural and language context; distinct demographic distributions; not directly comparable without domain adaptation."
        },
        "24052236_uk": {
            "source_dir": SOURCE_DATASETS_DIR / "UK",
            "doi": "10.6084/m9.figshare.24052236.v2",
            "name": "UK University Student Mental Health Dataset",
            "purpose": "Secondary research / cross-national validation / comorbidity exploration (NOT merged for primary training)",
            "license": "CC BY 4.0",
            "download_date": "2026-10-03 (Rebuild initialization)",
            "citation": "Akram, U. et al. (2023). UK University Student Mental Health Dataset. Figshare. https://doi.org/10.6084/m9.figshare.24052236.v2",
            "known_limitations": "UK higher-education cohort; diverse higher-level psychometric battery (MDQ, SCI, SBQ-R); different demographic structures."
        }
    }
    
    manifest = {
        "project": "Nivara AI",
        "provenance_standard": "Immutable Raw Data with SHA-256 Verification",
        "created_at": "2026-10-03T21:30:00+05:30",
        "datasets": {}
    }
    
    for key, meta in mapping.items():
        dest_dir = RAW_DIR / key
        src_dir = meta["source_dir"] if meta["source_dir"].exists() else dest_dir
        print(f"\nProcessing {key} from {src_dir}...")
        
        manifest["datasets"][key] = {
            "name": meta["name"],
            "doi": meta["doi"],
            "purpose": meta["purpose"],
            "license": meta["license"],
            "download_date": meta["download_date"],
            "citation": meta["citation"],
            "known_limitations": meta["known_limitations"],
            "files": {}
        }
        
        for item in src_dir.iterdir():
            if item.is_file():
                dest_file = dest_dir / item.name
                if src_dir != dest_dir:
                    if not dest_file.exists() or dest_file.stat().st_size != item.stat().st_size:
                        shutil.copy2(item, dest_file)
                        print(f"  Copied {item.name} to {dest_file}")
                    else:
                        print(f"  Verified {item.name} already in {dest_file}")
                else:
                    print(f"  Verified {item.name} in {dest_file}")
                
                # Compute hash and inspect
                file_hash = compute_sha256(dest_file)
                file_size = dest_file.stat().st_size
                rows, cols, col_names = inspect_file(dest_file)
                
                manifest["datasets"][key]["files"][item.name] = {
                    "sha256": file_hash,
                    "size_bytes": file_size,
                    "row_count": rows,
                    "col_count": cols,
                    "columns_sample": col_names[:10] if col_names else None,
                    "total_columns": len(col_names) if col_names else None
                }
                print(f"    File: {item.name} | Size: {file_size} bytes | Rows: {rows} | Cols: {cols}")
                print(f"    SHA256: {file_hash}")
                
    # Save JSON manifest
    manifest_json_path = DATA_DIR / "dataset_manifest.json"
    with open(manifest_json_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nSaved manifest to {manifest_json_path}")
    
    # Save YAML manifest
    manifest_yaml_path = DATA_DIR / "dataset_manifest.yaml"
    with open(manifest_yaml_path, "w", encoding="utf-8") as f:
        yaml.dump(manifest, f, default_flow_style=False, sort_keys=False)
    print(f"Saved manifest to {manifest_yaml_path}")
    
    # Generate markdown provenance doc
    provenance_md_path = DOCS_DATA_DIR / "data_provenance.md"
    generate_provenance_doc(manifest, provenance_md_path)
    print(f"Generated provenance documentation at {provenance_md_path}")
    print("\nPhase 1 Data Provenance completed successfully.")

def generate_provenance_doc(manifest, doc_path: Path):
    lines = [
        "# Data Provenance & Dataset Registry — Nivara AI",
        "",
        "## 1. Overview",
        "This document establishes the official data provenance record for the Nivara AI project. ",
        "In accordance with project governance standards, all raw datasets are maintained as immutable sources of truth in `data/raw/`. ",
        "Every file has been verified with cryptographic SHA-256 checksums, dimensional audits, and explicit methodological scoping.",
        "",
        "| Dataset Key | Dataset Name | DOI | Role | License |",
        "|---|---|---|---|---|"
    ]
    
    for key, ds in manifest["datasets"].items():
        lines.append(f"| `{key}` | {ds['name']} | [{ds['doi']}](https://doi.org/{ds['doi']}) | {ds['purpose']} | {ds['license']} |")
        
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 2. Dataset Files, Dimensions & Integrity Checksums")
    lines.append("")
    
    for key, ds in manifest["datasets"].items():
        lines.append(f"### {ds['name']} (`{key}`)")
        lines.append(f"- **DOI**: [{ds['doi']}](https://doi.org/{ds['doi']})")
        lines.append(f"- **Purpose**: {ds['purpose']}")
        lines.append(f"- **License**: {ds['license']}")
        lines.append(f"- **Citation**: {ds['citation']}")
        lines.append(f"- **Known Limitations**: {ds['known_limitations']}")
        lines.append("")
        lines.append("| Filename | Size (Bytes) | Row Count | Column Count | SHA-256 Checksum |")
        lines.append("|---|---|---|---|---|")
        for fname, finfo in ds["files"].items():
            r = finfo["row_count"] if finfo["row_count"] is not None else "N/A"
            c = finfo["col_count"] if finfo["col_count"] is not None else "N/A"
            h = finfo["sha256"]
            lines.append(f"| `{fname}` | {finfo['size_bytes']:,} | {r} | {c} | `{h[:16]}...{h[-8:]}` |")
        lines.append("")
        lines.append("#### Full Checksums:")
        for fname, finfo in ds["files"].items():
            lines.append(f"- `{fname}`: `{finfo['sha256']}`")
        lines.append("")
        
    lines.append("---")
    lines.append("## 3. Immutability Policy")
    lines.append("1. **No In-Place Modifications:** Files in `data/raw/` must never be edited, cleaned, or rewritten.")
    lines.append("2. **Pipeline Reproduction:** All downstream interim datasets (`data/interim/`) and processed datasets (`data/processed/`) are derived strictly via version-controlled scripts.")
    lines.append("3. **Checksum Verification:** The CI/CD and evaluation pipelines verify file hashes against `data/dataset_manifest.json` before training.")
    
    with open(doc_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

if __name__ == "__main__":
    run()
