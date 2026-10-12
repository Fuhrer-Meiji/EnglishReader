#!/usr/bin/env python3
"""
Standard Ebooks Full Catalog Scraper
Crawls all pages of standardebooks.org and generates a full catalog JSON.
"""

import os
import sys
import json
import re
import time
import urllib.request
import concurrent.futures
from typing import List, Dict, Any

PIPELINE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO_ROOT = os.path.dirname(os.path.dirname(PIPELINE_DIR))
OUTPUT_PATH = os.path.join(REPO_ROOT, "apps", "web", "data", "full_public_catalog.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) EnglishReaderCrawler/1.0"
}

def fetch_page_books(page_num: int) -> List[Dict[str, Any]]:
    url = f"https://standardebooks.org/ebooks?page={page_num}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            html = response.read().decode("utf-8")
            items = re.findall(r'<li typeof=\"schema:Book\" about=\"([^\"]+)\">(.*?)</li>', html, re.DOTALL)
            books = []
            for about, content in items:
                title_match = re.search(r'property=\"schema:name\">([^<]+)<', content)
                author_match = re.search(r'property=\"schema:author\"[^>]*>.*?property=\"schema:name\">([^<]+)<', content, re.DOTALL)
                
                title = title_match.group(1).strip() if title_match else "Untitled"
                author = author_match.group(1).strip() if author_match else "Unknown"
                slug = about.replace("/ebooks/", "").strip("/")
                
                # Extract simple id from slug
                parts = slug.split("/")
                book_id = parts[1] if len(parts) >= 2 else parts[0]
                
                books.append({
                    "id": book_id,
                    "slug": slug,
                    "title": title,
                    "author": author,
                    "source": "Standard Ebooks"
                })
            return books
    except Exception as e:
        print(f"[!] Error on page {page_num}: {e}")
        return []

def main():
    print("🚀 Starting full Standard Ebooks catalog crawl...")
    t0 = time.time()
    
    # 1. Determine total pages
    url = "https://standardebooks.org/ebooks"
    req = urllib.request.Request(url, headers=HEADERS)
    max_page = 128
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode("utf-8")
            pages = [int(p) for p in re.findall(r'page=(\d+)', html)]
            if pages:
                max_page = max(pages)
    except Exception as e:
        print(f"[!] Could not determine max page, using default {max_page}: {e}")

    print(f"[*] Detected {max_page} catalog pages. Fetching with 12 concurrent workers...")
    
    all_books = []
    seen_slugs = set()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        future_to_page = {executor.submit(fetch_page_books, p): p for p in range(1, max_page + 1)}
        for future in concurrent.futures.as_completed(future_to_page):
            books = future.result()
            for b in books:
                if b["slug"] not in seen_slugs:
                    seen_slugs.add(b["slug"])
                    all_books.append(b)

    all_books.sort(key=lambda x: (x["author"], x["title"]))
    
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_books, f, ensure_ascii=False, indent=2)

    elapsed = round(time.time() - t0, 1)
    print(f"\n[★] Crawl completed in {elapsed}s!")
    print(f"[✓] Saved {len(all_books)} curated classic books to {OUTPUT_PATH} ({os.path.getsize(OUTPUT_PATH) // 1024} KB)")

if __name__ == "__main__":
    main()
