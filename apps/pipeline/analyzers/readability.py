"""
Text Readability and Vocabulary Difficulty Analyzer
Calculates Flesch-Kincaid, Lexile approximation, CEFR level, and vocabulary distribution.
"""

import re
import math
import sqlite3
import os
from typing import Dict, Any, List

def count_syllables_in_word(word: str) -> int:
    """Counts approximate syllables in an English word using phonetic heuristics."""
    word = word.lower().strip()
    if len(word) <= 2:
        return 1

    # Remove non-alpha
    word = re.sub(r'[^a-z]', '', word)
    if not word:
        return 1

    # Remove silent trailing 'e', 'es', 'ed'
    if word.endswith('e') and not word.endswith('le') and len(word) > 2:
        word = word[:-1]
    elif word.endswith('es') or word.endswith('ed'):
        word = word[:-2]

    # Count vowel groups
    vowels = "aeiouy"
    count = 0
    in_vowel_group = False

    for char in word:
        if char in vowels:
            if not in_vowel_group:
                count += 1
                in_vowel_group = True
        else:
            in_vowel_group = False

    return max(1, count)

def split_into_sentences(text: str) -> List[str]:
    """Splits prose into sentences, respecting quotes and common abbreviations."""
    # Common abbreviations protect
    clean_text = text
    clean_text = re.sub(r'\b(Mr|Mrs|Ms|Dr|Prof|St|Inc|Ltd|vs|i\.e|e\.g)\.', r'\1<DOT>', clean_text)

    # Split by sentence end punctuation followed by whitespace or quotes
    raw_sentences = re.split(r'(?<=[.!?])[\s\n\r]+', clean_text)
    sentences = []

    for s in raw_sentences:
        s = s.replace('<DOT>', '.').strip()
        if len(s) > 1 and re.search(r'[a-zA-Z]', s):
            sentences.append(s)

    return sentences

def analyze_readability(text: str, dict_db_path: str = None) -> Dict[str, Any]:
    """
    Analyzes text and returns:
    - wordCount
    - fleschScore (Flesch Reading Ease)
    - fleschKincaidGrade (FKGL)
    - lexile (e.g. 1020L)
    - cefr ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')
    - levelDistribution ({ basic: %, cet4: %, cet6: %, gre: % })
    """
    sentences = split_into_sentences(text)
    num_sentences = max(1, len(sentences))

    # Tokenize words
    words = re.findall(r"\b[a-zA-Z’']+\b", text)
    num_words = max(1, len(words))

    total_syllables = sum(count_syllables_in_word(w) for w in words)

    # 1. Flesch Reading Ease: 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
    asl = num_words / num_sentences # average sentence length
    asw = total_syllables / num_words # average syllables per word

    flesch_reading_ease = 206.835 - (1.015 * asl) - (84.6 * asw)
    flesch_score = round(max(0.0, min(100.0, flesch_reading_ease)), 1)

    # 2. Flesch-Kincaid Grade Level: 0.39*(words/sentences) + 11.8*(syllables/words) - 15.59
    fkgl = (0.39 * asl) + (11.8 * asw) - 15.59
    fkgl = max(1.0, round(fkgl, 1))

    # 3. Lexile Measure Approximation
    # FKGL 1 -> ~200L, FKGL 6 -> ~750L, FKGL 9 -> ~1000L, FKGL 12 -> ~1250L
    approx_lexile = int(round((fkgl * 115) + 80, -1))
    approx_lexile = max(200, min(1600, approx_lexile))
    lexile_str = f"{approx_lexile}L"

    # 4. CEFR Classification
    if flesch_score >= 85 or fkgl <= 4.0:
        cefr = "A2"
    elif flesch_score >= 70 or fkgl <= 7.0:
        cefr = "B1"
    elif flesch_score >= 55 or fkgl <= 10.0:
        cefr = "B2"
    elif flesch_score >= 35 or fkgl <= 13.5:
        cefr = "C1"
    else:
        cefr = "C2"

    # 5. Vocabulary Level Composition from SQLite ECDICT (if available)
    level_dist = {
        "basic": 80,
        "cet4": 10,
        "cet6": 6,
        "gre": 4
    }

    if dict_db_path and os.path.exists(dict_db_path):
        try:
            conn = sqlite3.connect(dict_db_path)
            cur = conn.cursor()

            unique_words = list(set(w.lower().replace("’", "").replace("'", "") for w in words if len(w) > 1))
            cat_counts = {"basic": 0, "cet4": 0, "cet6": 0, "gre": 0}

            for w in unique_words:
                cur.execute("SELECT tag FROM words WHERE word = ? LIMIT 1", (w,))
                row = cur.fetchone()
                if not row or not row[0]:
                    cat_counts["basic"] += 1
                else:
                    tag = row[0].lower()
                    if "gre" in tag:
                        cat_counts["gre"] += 1
                    elif "cet6" in tag or "ky" in tag:
                        cat_counts["cet6"] += 1
                    elif "cet4" in tag or "gk" in tag:
                        cat_counts["cet4"] += 1
                    else:
                        cat_counts["basic"] += 1

            total_unique = max(1, len(unique_words))
            basic_pct = round(cat_counts["basic"] * 100 / total_unique)
            cet4_pct = round(cat_counts["cet4"] * 100 / total_unique)
            cet6_pct = round(cat_counts["cet6"] * 100 / total_unique)
            gre_pct = max(0, 100 - (basic_pct + cet4_pct + cet6_pct))

            level_dist = {
                "basic": basic_pct,
                "cet4": cet4_pct,
                "cet6": cet6_pct,
                "gre": gre_pct
            }
            conn.close()
        except Exception as e:
            print(f"[!] Readability db lookup warning: {e}")

    return {
        "wordCount": num_words,
        "fleschScore": flesch_score,
        "fleschGrade": fkgl,
        "lexile": lexile_str,
        "cefr": cefr,
        "levelDistribution": level_dist
    }
