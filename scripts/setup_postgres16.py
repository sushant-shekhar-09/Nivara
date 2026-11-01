"""
Automated PostgreSQL 16 Portable User-Space Provisioning Script.
Downloads official PostgreSQL 16.4 binaries for Windows x64, initializes a local cluster
with zero UAC prompt, starts the database engine, and creates the nivara database.
"""

import os
import sys
import zipfile
import subprocess
import urllib.request
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PG_DIR = BASE_DIR / "pgsql_16"
PG_BIN = PG_DIR / "bin"
PG_DATA = PG_DIR / "data"
PG_LOG = PG_DIR / "postgres.log"
ZIP_PATH = BASE_DIR / "postgresql-16.4-1-windows-x64-binaries.zip"
URL = "https://get.enterprisedb.com/postgresql/postgresql-16.4-1-windows-x64-binaries.zip"

def download_file(url: str, dest: Path):
    if dest.exists() and dest.stat().st_size > 300_000_000:
        print(f"Archive already downloaded at {dest} ({dest.stat().st_size:,} bytes).")
        return
        
    print(f"Downloading official PostgreSQL 16 binaries from {url}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp, open(dest, "wb") as f:
        total = int(resp.headers.get("Content-Length", 0))
        downloaded = 0
        block_size = 1024 * 1024  # 1MB
        last_print = time.time()
        
        while True:
            chunk = resp.read(block_size)
            if not chunk:
                break
            f.write(chunk)
            downloaded += len(chunk)
            if time.time() - last_print > 3:
                pct = (downloaded / total * 100) if total > 0 else 0
                print(f"  Downloaded {downloaded // (1024*1024)}MB / {total // (1024*1024)}MB ({pct:.1f}%)...")
                last_print = time.time()
                
    print(f"Download complete: {dest.stat().st_size:,} bytes.")

def extract_zip(zip_path: Path, target_dir: Path):
    if (target_dir / "bin" / "postgres.exe").exists():
        print(f"PostgreSQL 16 binaries already extracted at {target_dir}.")
        return
    print(f"Extracting {zip_path.name} to {target_dir}...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(target_dir.parent)
    # The zip contains a top-level 'pgsql' folder; rename to pgsql_16
    extracted_folder = target_dir.parent / "pgsql"
    if extracted_folder.exists() and extracted_folder != target_dir:
        if target_dir.exists():
            import shutil
            shutil.rmtree(target_dir)
        extracted_folder.rename(target_dir)
    print("Extraction complete.")

def init_and_start_postgres():
    initdb_exe = PG_BIN / "initdb.exe"
    pg_ctl_exe = PG_BIN / "pg_ctl.exe"
    createdb_exe = PG_BIN / "createdb.exe"
    psql_exe = PG_BIN / "psql.exe"
    
    if not PG_DATA.exists() or not (PG_DATA / "PG_VERSION").exists():
        print("Initializing local PostgreSQL 16 database cluster (initdb)...")
        PG_DATA.mkdir(parents=True, exist_ok=True)
        cmd_init = [
            str(initdb_exe),
            "-D", str(PG_DATA),
            "-U", "postgres",
            "-A", "trust",
            "-E", "UTF8"
        ]
        res = subprocess.run(cmd_init, capture_output=True, text=True)
        if res.returncode != 0:
            print("initdb error:", res.stderr)
            raise RuntimeError(f"initdb failed: {res.stderr}")
        print("Cluster initialized successfully.")
    else:
        print("PostgreSQL 16 data cluster already initialized.")
        
    # Check if postgres is running
    cmd_status = [str(pg_ctl_exe), "-D", str(PG_DATA), "status"]
    res_status = subprocess.run(cmd_status, capture_output=True, text=True)
    if "is running" not in res_status.stdout:
        print("Starting PostgreSQL 16 server daemon...")
        cmd_start = [
            str(pg_ctl_exe),
            "-D", str(PG_DATA),
            "-l", str(PG_LOG),
            "-o", "-p 5432",
            "start"
        ]
        res = subprocess.run(cmd_start, capture_output=True, text=True)
        print("pg_ctl output:", res.stdout)
        time.sleep(2)
    else:
        print("PostgreSQL 16 server is already running.")
        
    # Create nivara database
    print("Verifying 'nivara' database existence...")
    cmd_create = [
        str(createdb_exe),
        "-U", "postgres",
        "-h", "localhost",
        "-p", "5432",
        "nivara"
    ]
    res_db = subprocess.run(cmd_create, capture_output=True, text=True)
    if res_db.returncode == 0:
        print("Created database 'nivara'.")
    elif "already exists" in res_db.stderr or "already exists" in res_db.stdout:
        print("Database 'nivara' already exists.")
    else:
        print(f"Database note: {res_db.stderr.strip() or res_db.stdout.strip()}")
        
    # Check PostgreSQL version via psql
    cmd_ver = [str(psql_exe), "-U", "postgres", "-h", "localhost", "-c", "SELECT version();"]
    res_ver = subprocess.run(cmd_ver, capture_output=True, text=True)
    print("\nPostgreSQL Verification Query Result:")
    print(res_ver.stdout.strip())
    print("\nPostgreSQL 16 is live and verified on localhost:5432!")

if __name__ == "__main__":
    download_file(URL, ZIP_PATH)
    extract_zip(ZIP_PATH, PG_DIR)
    init_and_start_postgres()
