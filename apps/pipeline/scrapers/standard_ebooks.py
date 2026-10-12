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
    },
    "frankenstein": {
        "title": "Frankenstein",
        "author": "Mary Shelley",
        "url": "https://standardebooks.org/ebooks/mary-shelley/frankenstein/downloads/mary-shelley_frankenstein.epub?source=download",
        "filename": "frankenstein.epub"
    },
    "jane-eyre": {
        "title": "Jane Eyre",
        "author": "Charlotte Brontë",
        "url": "https://standardebooks.org/ebooks/charlotte-bronte/jane-eyre/downloads/charlotte-bronte_jane-eyre.epub?source=download",
        "filename": "jane-eyre.epub"
    },
    "dracula": {
        "title": "Dracula",
        "author": "Bram Stoker",
        "url": "https://standardebooks.org/ebooks/bram-stoker/dracula/downloads/bram-stoker_dracula.epub?source=download",
        "filename": "dracula.epub"
    },
    "the-adventures-of-sherlock-holmes": {
        "title": "The Adventures of Sherlock Holmes",
        "author": "Arthur Conan Doyle",
        "url": "https://standardebooks.org/ebooks/arthur-conan-doyle/the-adventures-of-sherlock-holmes/downloads/arthur-conan-doyle_the-adventures-of-sherlock-holmes.epub?source=download",
        "filename": "the-adventures-of-sherlock-holmes.epub"
    },
    "sherlock-holmes": {
        "title": "The Adventures of Sherlock Holmes",
        "author": "Arthur Conan Doyle",
        "url": "https://standardebooks.org/ebooks/arthur-conan-doyle/the-adventures-of-sherlock-holmes/downloads/arthur-conan-doyle_the-adventures-of-sherlock-holmes.epub?source=download",
        "filename": "the-adventures-of-sherlock-holmes.epub"
    },
    "a-tale-of-two-cities": {
        "title": "A Tale of Two Cities",
        "author": "Charles Dickens",
        "url": "https://standardebooks.org/ebooks/charles-dickens/a-tale-of-two-cities/downloads/charles-dickens_a-tale-of-two-cities.epub?source=download",
        "filename": "a-tale-of-two-cities.epub"
    },
    "wuthering-heights": {
        "title": "Wuthering Heights",
        "author": "Emily Brontë",
        "url": "https://standardebooks.org/ebooks/emily-bronte/wuthering-heights/downloads/emily-bronte_wuthering-heights.epub?source=download",
        "filename": "wuthering-heights.epub"
    },
    "the-time-machine": {
        "title": "The Time Machine",
        "author": "H. G. Wells",
        "url": "https://standardebooks.org/ebooks/h-g-wells/the-time-machine/downloads/h-g-wells_the-time-machine.epub?source=download",
        "filename": "the-time-machine.epub"
    },
    "heart-of-darkness": {
        "title": "Heart of Darkness",
        "author": "Joseph Conrad",
        "url": "https://standardebooks.org/ebooks/joseph-conrad/heart-of-darkness/downloads/joseph-conrad_heart-of-darkness.epub?source=download",
        "filename": "heart-of-darkness.epub"
    },
    "moby-dick": {
        "title": "Moby Dick",
        "author": "Herman Melville",
        "url": "https://standardebooks.org/ebooks/herman-melville/moby-dick/downloads/herman-melville_moby-dick.epub?source=download",
        "filename": "moby-dick.epub"
    },
    "the-adventures-of-tom-sawyer": {
        "title": "The Adventures of Tom Sawyer",
        "author": "Mark Twain",
        "url": "https://standardebooks.org/ebooks/mark-twain/the-adventures-of-tom-sawyer/downloads/mark-twain_the-adventures-of-tom-sawyer.epub?source=download",
        "filename": "the-adventures-of-tom-sawyer.epub"
    },
    "tom-sawyer": {
        "title": "The Adventures of Tom Sawyer",
        "author": "Mark Twain",
        "url": "https://standardebooks.org/ebooks/mark-twain/the-adventures-of-tom-sawyer/downloads/mark-twain_the-adventures-of-tom-sawyer.epub?source=download",
        "filename": "the-adventures-of-tom-sawyer.epub"
    },
    "the-call-of-the-wild": {
        "title": "The Call of the Wild",
        "author": "Jack London",
        "url": "https://standardebooks.org/ebooks/jack-london/the-call-of-the-wild/downloads/jack-london_the-call-of-the-wild.epub?source=download",
        "filename": "the-call-of-the-wild.epub"
    },
    "the-strange-case-of-dr-jekyll-and-mr-hyde": {
        "title": "The Strange Case of Dr. Jekyll and Mr. Hyde",
        "author": "Robert Louis Stevenson",
        "url": "https://standardebooks.org/ebooks/robert-louis-stevenson/the-strange-case-of-dr-jekyll-and-mr-hyde/downloads/robert-louis-stevenson_the-strange-case-of-dr-jekyll-and-mr-hyde.epub?source=download",
        "filename": "the-strange-case-of-dr-jekyll-and-mr-hyde.epub"
    },
    "dr-jekyll-and-mr-hyde": {
        "title": "The Strange Case of Dr. Jekyll and Mr. Hyde",
        "author": "Robert Louis Stevenson",
        "url": "https://standardebooks.org/ebooks/robert-louis-stevenson/the-strange-case-of-dr-jekyll-and-mr-hyde/downloads/robert-louis-stevenson_the-strange-case-of-dr-jekyll-and-mr-hyde.epub?source=download",
        "filename": "the-strange-case-of-dr-jekyll-and-mr-hyde.epub"
    },
    "walden": {
        "title": "Walden",
        "author": "Henry David Thoreau",
        "url": "https://standardebooks.org/ebooks/henry-david-thoreau/walden/downloads/henry-david-thoreau_walden.epub?source=download",
        "filename": "walden.epub"
    },
    "peter-and-wendy": {
        "title": "Peter and Wendy",
        "author": "J. M. Barrie",
        "url": "https://standardebooks.org/ebooks/j-m-barrie/peter-and-wendy/downloads/j-m-barrie_peter-and-wendy.epub?source=download",
        "filename": "peter-and-wendy.epub"
    },
    "great-expectations": {
        "title": "Great Expectations",
        "author": "Charles Dickens",
        "url": "https://standardebooks.org/ebooks/charles-dickens/great-expectations/downloads/charles-dickens_great-expectations.epub?source=download",
        "filename": "great-expectations.epub"
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
