#!/usr/bin/env python3
"""
EnglishReader - ECDICT Dictionary & Lemmatization Database Generator
Creates an optimized, indexed SQLite database for sub-5ms dictionary queries.
"""

import os
import sys
import csv
import sqlite3
import urllib.request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TARGET_DIR = os.path.join(BASE_DIR, "apps", "web", "data")
DB_PATH = os.path.join(TARGET_DIR, "dict.db")

ECDICT_URL = "https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv"
LEMMA_URL = "https://raw.githubusercontent.com/skywind3000/ECDICT/master/lemma.en.txt"

def ensure_dirs():
    os.makedirs(TARGET_DIR, exist_ok=True)

def download_file(url: str, dest_path: str, desc: str):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        print(f"[✓] {desc} already exists at {dest_path}")
        return

    print(f"[↓] Downloading {desc} from {url}...")
    try:
        def reporthook(count, block_size, total_size):
            if total_size > 0:
                percent = int(count * block_size * 100 / total_size)
                sys.stdout.write(f"\r    Progress: {percent}% ({count * block_size // (1024*1024)}MB / {total_size // (1024*1024)}MB)")
                sys.stdout.flush()

        urllib.request.urlretrieve(url, dest_path, reporthook=reporthook)
        print(f"\n[✓] Downloaded {desc} successfully.")
    except Exception as e:
        print(f"\n[!] Failed to download from {url}: {e}")
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise e

def build_database(csv_path: str, lemma_path: str):
    print(f"\n[*] Building SQLite database at {DB_PATH}...")
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("PRAGMA synchronous = OFF;")
    cur.execute("PRAGMA journal_mode = MEMORY;")

    # Table for words
    cur.execute("""
    CREATE TABLE words (
        word TEXT PRIMARY KEY,
        phonetic TEXT,
        definition TEXT,
        translation TEXT,
        pos TEXT,
        collins INTEGER,
        oxford INTEGER,
        tag TEXT,
        bnc INTEGER,
        frq INTEGER,
        exchange TEXT
    );
    """)

    # Table for lemmatization (inflected -> base form)
    cur.execute("""
    CREATE TABLE lemmas (
        word TEXT PRIMARY KEY,
        lemma TEXT
    );
    """)

    # 1. Parse Lemma file
    if os.path.exists(lemma_path):
        print("[*] Processing lemmatization mappings...")
        lemma_batch = []
        with open(lemma_path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith(";"):
                    continue
                if "->" in line:
                    base_part, inflected_part = line.split("->", 1)
                    base_word = base_part.split("/")[0].strip().lower()
                    inflections = [w.strip().lower() for w in inflected_part.split(",") if w.strip()]
                    for inf in inflections:
                        if inf != base_word:
                            lemma_batch.append((inf, base_word))
                            if len(lemma_batch) >= 10000:
                                cur.executemany("INSERT OR REPLACE INTO lemmas (word, lemma) VALUES (?, ?);", lemma_batch)
                                lemma_batch = []

        if lemma_batch:
            cur.executemany("INSERT OR REPLACE INTO lemmas (word, lemma) VALUES (?, ?);", lemma_batch)
        print(f"[✓] Lemmas indexed.")

    # 2. Parse ECDICT CSV
    if os.path.exists(csv_path):
        print("[*] Importing ECDICT entries into SQLite...")
        words_batch = []
        count = 0
        with open(csv_path, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                word = row.get("word", "").strip()
                if not word:
                    continue

                words_batch.append((
                    word.lower(),
                    row.get("phonetic", ""),
                    row.get("definition", ""),
                    row.get("translation", ""),
                    row.get("pos", ""),
                    int(row.get("collins") or 0),
                    int(row.get("oxford") or 0),
                    row.get("tag", ""),
                    int(row.get("bnc") or 0),
                    int(row.get("frq") or 0),
                    row.get("exchange", "")
                ))
                count += 1
                if len(words_batch) >= 10000:
                    cur.executemany("""
                    INSERT OR REPLACE INTO words 
                    (word, phonetic, definition, translation, pos, collins, oxford, tag, bnc, frq, exchange)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                    """, words_batch)
                    words_batch = []
                    sys.stdout.write(f"\r    Imported {count} words...")
                    sys.stdout.flush()

        if words_batch:
            cur.executemany("""
            INSERT OR REPLACE INTO words 
            (word, phonetic, definition, translation, pos, collins, oxford, tag, bnc, frq, exchange)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, words_batch)
        print(f"\n[✓] Imported total {count} words.")

    # Create indices
    print("[*] Optimizing database indices...")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_words_tag ON words(tag);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_lemmas_word ON lemmas(word);")

    conn.commit()
    conn.close()

    size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"\n[★] Dictionary database generated successfully: {DB_PATH} ({size_mb:.1f} MB)")

def main():
    ensure_dirs()
    temp_dir = os.path.join(BASE_DIR, "apps", "pipeline", "cache")
    os.makedirs(temp_dir, exist_ok=True)

    lemma_file = os.path.join(temp_dir, "lemma.en.txt")
    csv_file = os.path.join(temp_dir, "ecdict.csv")

    try:
        download_file(LEMMA_URL, lemma_file, "Lemmatization dataset")
        download_file(ECDICT_URL, csv_file, "ECDICT dataset")
        build_database(csv_file, lemma_file)
    except Exception as e:
        print(f"[!] Error preparing dictionary: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
