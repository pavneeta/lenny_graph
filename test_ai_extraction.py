#!/usr/bin/env python3
"""
Test script to verify Together.ai API connection and extraction quality.
Tests with a single episode first.
"""

import os
import json
from pathlib import Path
from extract_metadata_ai import process_transcript

# Get API key
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
if not TOGETHER_API_KEY:
    print("ERROR: TOGETHER_API_KEY environment variable not set.")
    print("Please set it with: export TOGETHER_API_KEY='your-api-key'")
    exit(1)

# Find a test episode (use Brian Chesky as it's likely to have good content)
base_dir = Path(__file__).parent
test_file = base_dir / "Brian Chesky.txt"

if not test_file.exists():
    # Try to find any episode
    transcript_files = list(base_dir.glob('*.txt'))
    if transcript_files:
        test_file = transcript_files[0]
    else:
        print("No transcript files found!")
        exit(1)

print(f"Testing with episode: {test_file.name}")
print("=" * 60)

episode_data = process_transcript(test_file, test_file.stem)

if episode_data:
    print("\n✅ Success! Extracted metadata:")
    print(json.dumps(episode_data, indent=2))
    print("\n" + "=" * 60)
    print("If this looks good, you can run the full extraction:")
    print("  python3 extract_metadata_ai.py")
else:
    print("\n❌ Failed to extract metadata. Check API key and connection.")

