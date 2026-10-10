#!/usr/bin/env python3
"""
EnglishReader - Book Data Pipeline CLI
Downloads, cleans, and analyzes public-domain EPUB books, generating structured JSON books.
"""

import os
import sys
import json
import argparse
from typing import Optional

# Setup import path
PIPELINE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PIPELINE_DIR)

from scrapers.standard_ebooks import download_standard_ebook, CATALOG
from cleaners.epub_cleaner import parse_epub_to_book

REPO_ROOT = os.path.dirname(os.path.dirname(PIPELINE_DIR))
CACHE_DIR = os.path.join(PIPELINE_DIR, "cache")
OUTPUT_DIR = os.path.join(REPO_ROOT, "apps", "web", "data", "books")
DICT_DB_PATH = os.path.join(REPO_ROOT, "apps", "web", "data", "dict.db")

def process_single_book(slug: Optional[str] = None, custom_file: Optional[str] = None):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(CACHE_DIR, exist_ok=True)

    if custom_file:
        epub_path = custom_file
        print(f"\n[📖] Processing local EPUB: {epub_path}")
    elif slug:
        print(f"\n[📖] Processing catalog book: {slug}")
        epub_path = download_standard_ebook(slug, CACHE_DIR)
        if not epub_path:
            print(f"[!] Failed to acquire EPUB for '{slug}'. Skipping.")
            return False
    else:
        print("[!] No book slug or file provided.")
        return False

    print(f"[*] Parsing and cleaning EPUB structure...")
    try:
        book_data = parse_epub_to_book(epub_path, DICT_DB_PATH)
        book_id = book_data["id"]
        out_file = os.path.join(OUTPUT_DIR, f"{book_id}.json")

        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(book_data, f, ensure_ascii=False, indent=2)

        total_words = sum(c["stats"]["wordCount"] for c in book_data["chapters"])
        avg_flesch = round(sum(c["stats"]["fleschScore"] for c in book_data["chapters"]) / max(1, len(book_data["chapters"])), 1)
        
        # Display summary card
        print(f"\n" + "="*56)
        print(f"  ✓ Successfully compiled: {book_data['title']}")
        print(f"  Author:         {book_data['author']} ({book_data['publishedYear']})")
        print(f"  Total Chapters: {book_data['totalChapters']}")
        print(f"  Total Words:    {total_words:,} words")
        print(f"  Average Flesch: {avg_flesch} (Reading Ease)")
        print(f"  Output JSON:    {out_file} ({os.path.getsize(out_file) // 1024} KB)")
        print("="*56 + "\n")
        return True
    except Exception as e:
        print(f"[!] Error processing book: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    parser = argparse.ArgumentParser(
        description="EnglishReader Data Pipeline - Process public domain EPUB books"
    )
    parser.add_argument("--book", type=str, help="Book slug from catalog (e.g. the-great-gatsby)")
    parser.add_argument("--file", type=str, help="Path to local EPUB file")
    parser.add_argument("--all", action="store_true", help="Process all catalog books")
    parser.add_argument("--list", action="store_true", help="List available catalog titles")

    args = parser.parse_args()

    if args.list:
        print("\nAvailable catalog books in Standard Ebooks:")
        for slug, info in CATALOG.items():
            print(f"  - {slug:30} : {info['title']} by {info['author']}")
        print()
        return

    if args.all:
        print(f"[*] Processing all {len(CATALOG)} catalog books...")
        success_count = 0
        for slug in CATALOG.keys():
            if process_single_book(slug=slug):
                success_count += 1
        print(f"\n[★] Finished processing {success_count}/{len(CATALOG)} books.")
        return

    if args.file:
        process_single_book(custom_file=args.file)
        return

    # Default to Gatsby if no flag given
    book_slug = args.book or "the-great-gatsby"
    process_single_book(slug=book_slug)

if __name__ == "__main__":
    main()
