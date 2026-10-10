"""
Standard Ebooks Scraper & Downloader
Downloads beautifully formatted public-domain EPUBs from standardebooks.org.
"""

import os
import sys
import urllib.request
from typing import Dict, Optional

CATALOG: Dict[str, Dict[str, str]] = {
    "the-great-gatsby": {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "url": "https://standardebooks.org/ebooks/f-scott-fitzgerald/the-great-gatsby/downloads/f-scott-fitzgerald_the-great-gatsby.epub?source=download",
        "filename": "the-great-gatsby.epub"
    },
    "alices-adventures-in-wonderland": {
        "title": "Alice's Adventures in Wonderland",
        "author": "Lewis Carroll",
        "url": "https://standardebooks.org/ebooks/lewis-carroll/alices-adventures-in-wonderland/john-tenniel/downloads/lewis-carroll_alices-adventures-in-wonderland_john-tenniel.epub?source=download",
        "filename": "alices-adventures-in-wonderland.epub"
    },
    "the-picture-of-dorian-gray": {
        "title": "The Picture of Dorian Gray",
        "author": "Oscar Wilde",
        "url": "https://standardebooks.org/ebooks/oscar-wilde/the-picture-of-dorian-gray/downloads/oscar-wilde_the-picture-of-dorian-gray.epub?source=download",
        "filename": "the-picture-of-dorian-gray.epub"
    },
    "pride-and-prejudice": {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "url": "https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/downloads/jane-austen_pride-and-prejudice.epub?source=download",
        "filename": "pride-and-prejudice.epub"
    }
}

def download_standard_ebook(slug: str, cache_dir: str) -> Optional[str]:
    """
    Downloads an EPUB from Standard Ebooks and returns the local file path.
    """
    os.makedirs(cache_dir, exist_ok=True)

    if slug in CATALOG:
        info = CATALOG[slug]
        url = info["url"]
        filename = info["filename"]
    else:
        # Generic slug format fallback
        url = f"https://standardebooks.org/ebooks/{slug}/downloads/{slug}.epub?source=download"
        filename = f"{slug.replace('/', '_')}.epub"

    dest_path = os.path.join(cache_dir, filename)

    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 10000:
        print(f"[✓] Found cached EPUB: {dest_path}")
        return dest_path

    print(f"[↓] Downloading '{slug}' from Standard Ebooks...")
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) EnglishReaderPipeline/1.0"
            }
        )
        with urllib.request.urlopen(req, timeout=20) as response, open(dest_path, "wb") as out_file:
            data = response.read()
            out_file.write(data)

        # Validate that the downloaded file is a real ZIP/EPUB
        if os.path.getsize(dest_path) < 10000:
            os.remove(dest_path)
            raise ValueError(f"Downloaded file too small, likely an HTML error page.")

        print(f"[✓] Downloaded and saved: {dest_path} ({os.path.getsize(dest_path) // 1024} KB)")
        return dest_path
    except Exception as e:
        print(f"[!] Error downloading {slug}: {e}")
        if os.path.exists(dest_path):
            os.remove(dest_path)
        return None
