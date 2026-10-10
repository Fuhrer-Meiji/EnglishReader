"""
EPUB Cleaner and Standardizer
Extracts chapters, cleans XHTML/HTML markup, splits sentences, and computes readability.
"""

import os
import re
import zipfile
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from typing import Dict, Any, List, Optional
from analyzers.readability import analyze_readability, split_into_sentences

class HTMLTextExtractor(HTMLParser):
    """Clean HTML parser that extracts text by paragraphs while stripping styling tags."""
    def __init__(self):
        super().__init__()
        self.paragraphs: List[str] = []
        self.current_paragraph: List[str] = []
        self.in_p = False
        self.headings: List[str] = []
        self.in_heading = False
        self.current_heading: List[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in ('p', 'blockquote'):
            self.in_p = True
            self.current_paragraph = []
        elif tag in ('h1', 'h2', 'h3', 'h4'):
            self.in_heading = True
            self.current_heading = []
        elif tag == 'br' and self.in_p:
            self.current_paragraph.append(' ')

    def handle_endtag(self, tag):
        if tag in ('p', 'blockquote'):
            self.in_p = False
            text = ' '.join(self.current_paragraph).strip()
            # Normalize whitespace
            text = re.sub(r'\s+', ' ', text)
            if len(text) > 5:
                self.paragraphs.append(text)
            self.current_paragraph = []
        elif tag in ('h1', 'h2', 'h3', 'h4'):
            self.in_heading = False
            text = ' '.join(self.current_heading).strip()
            text = re.sub(r'\s+', ' ', text)
            if text:
                self.headings.append(text)
            self.current_heading = []

    def handle_data(self, data):
        if self.in_p:
            self.current_paragraph.append(data)
        elif self.in_heading:
            self.current_heading.append(data)

def clean_chapter_html(html_content: str) -> Dict[str, Any]:
    parser = HTMLTextExtractor()
    parser.feed(html_content)

    title = parser.headings[0] if parser.headings else ""
    paragraphs = parser.paragraphs

    return {
        "title": title,
        "paragraphs": paragraphs
    }

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[\s_-]+', '-', text)

def parse_epub_to_book(epub_path: str, dict_db_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Parses a Standard Ebooks or standard EPUB file into structured EnglishReader JSON format.
    """
    if not os.path.exists(epub_path):
        raise FileNotFoundError(f"EPUB file not found: {epub_path}")

    with zipfile.ZipFile(epub_path, 'r') as zf:
        namelist = zf.namelist()

        # 1. Locate OPF file from META-INF/container.xml
        container_xml = zf.read('META-INF/container.xml').decode('utf-8', errors='ignore')
        container_root = ET.fromstring(container_xml)
        rootfile_elem = container_root.find('.//{*}rootfile')
        if rootfile_elem is None:
            raise ValueError("Invalid EPUB: META-INF/container.xml rootfile missing")
        opf_path = rootfile_elem.attrib['full-path']
        opf_dir = os.path.dirname(opf_path)

        # 2. Parse OPF file
        opf_xml = zf.read(opf_path).decode('utf-8', errors='ignore')
        opf_root = ET.fromstring(opf_xml)

        # Extract Metadata
        title = "Untitled"
        author = "Unknown Author"
        published_year = 1900
        description = ""

        title_elem = opf_root.find('.//{*}metadata/{*}title')
        if title_elem is not None and title_elem.text:
            title = title_elem.text.strip()

        creator_elem = opf_root.find('.//{*}metadata/{*}creator')
        if creator_elem is not None and creator_elem.text:
            author = creator_elem.text.strip()

        date_elem = opf_root.find('.//{*}metadata/{*}date')
        if date_elem is not None and date_elem.text:
            match = re.search(r'\b(1[6-9]\d{2}|20\d{2})\b', date_elem.text)
            if match:
                published_year = int(match.group(1))

        desc_elem = opf_root.find('.//{*}metadata/{*}description')
        if desc_elem is not None and desc_elem.text:
            description = desc_elem.text.strip()

        # Extract Manifest (id -> href)
        manifest = {}
        for item in opf_root.findall('.//{*}manifest/{*}item'):
            item_id = item.attrib.get('id')
            item_href = item.attrib.get('href')
            if item_id and item_href:
                manifest[item_id] = item_href

        # Extract Spine reading order
        spine_ids = []
        for itemref in opf_root.findall('.//{*}spine/{*}itemref'):
            idref = itemref.attrib.get('idref')
            if idref:
                spine_ids.append(idref)

        # 3. Read content files in spine order
        chapters = []
        chapter_idx = 1

        # Patterns for boilerplate pages to skip
        boilerplate_patterns = [
            'colophon', 'uncopyright', 'titlepage', 'imprint', 'toc', 
            'halftitle', 'cover', 'endnotes', 'dedication'
        ]

        for sid in spine_ids:
            href = manifest.get(sid)
            if not href:
                continue

            # Check if this item is boilerplate
            href_lower = href.lower()
            if any(p in href_lower for p in boilerplate_patterns):
                continue

            full_href = os.path.normpath(os.path.join(opf_dir, href)) if opf_dir else href
            if full_href not in namelist:
                continue

            html_content = zf.read(full_href).decode('utf-8', errors='ignore')
            parsed = clean_chapter_html(html_content)

            paragraphs = parsed['paragraphs']
            # Only consider files with substantial paragraphs (ignore empty headers or 1-line notes)
            if len(paragraphs) < 2:
                continue

            chapter_title = parsed['title'] or f"Chapter {chapter_idx}"
            full_chapter_text = "\n\n".join(paragraphs)

            # Analyze readability & difficulty metrics
            stats = analyze_readability(full_chapter_text, dict_db_path)

            # Build sentence analysis list
            sentences_list = []
            sent_counter = 1

            for p_idx, para in enumerate(paragraphs):
                raw_sentences = split_into_sentences(para)
                for s_text in raw_sentences:
                    s_words = re.findall(r'\b[a-zA-Z]+\b', s_text)
                    length = len(s_words)
                    
                    if length > 28:
                        diff_tag = "长难句"
                    elif length > 16:
                        diff_tag = "中等"
                    else:
                        diff_tag = "基础"

                    sentences_list.append({
                        "id": f"c{chapter_idx}-s{sent_counter}",
                        "paragraphIndex": p_idx,
                        "rawText": s_text,
                        "chineseTranslation": "", # Can be translated via LLM
                        "difficultyTag": diff_tag,
                        "grammarComponents": [],
                        "culturalNote": "",
                        "coreKeywords": [w.lower() for w in s_words if len(w) >= 7][:5]
                    })
                    sent_counter += 1

            chapters.append({
                "id": f"chapter-{chapter_idx}",
                "number": chapter_idx,
                "title": chapter_title,
                "subtitle": paragraphs[0][:60] + "..." if paragraphs else "",
                "sentences": sentences_list,
                "stats": {
                    "wordCount": stats["wordCount"],
                    "cefr": stats["cefr"],
                    "fleschScore": stats["fleschScore"],
                    "lexile": stats["lexile"],
                    "levelDistribution": stats["levelDistribution"]
                }
            })
            chapter_idx += 1

        book_id = slugify(title)
        return {
            "id": book_id,
            "title": title,
            "author": author,
            "publishedYear": published_year,
            "description": description,
            "source": "Standard Ebooks",
            "totalChapters": len(chapters),
            "chapters": chapters
        }
