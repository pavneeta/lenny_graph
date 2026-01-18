#!/usr/bin/env python3
"""
Script to convert all transcript text files to JSONL format for batch inference.
"""

import os
import json
from pathlib import Path
from typing import List, Dict

def process_transcript_file(file_path: Path) -> Dict:
    """Process a single transcript file and return JSON-ready data."""
    try:
        episode_name = file_path.stem
        
        # Read the transcript content
        with open(file_path, 'r', encoding='utf-8') as f:
            transcript_text = f.read()
        
        # Extract guest name (usually the first speaker that's not "Lenny")
        guest_name = None
        lines = transcript_text.split('\n')
        for line in lines[:20]:  # Check first 20 lines
            if ':' in line and 'Lenny' not in line and '(' in line:
                guest_name = line.split('(')[0].strip()
                break
        
        if not guest_name:
            guest_name = episode_name
        
        # Create JSON object for batch inference
        return {
            "id": episode_name,
            "episode_name": episode_name,
            "guest_name": guest_name,
            "text": transcript_text,
            "file_path": str(file_path.name)
        }
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def main():
    """Main function to convert all transcripts to JSONL."""
    base_dir = Path(__file__).parent
    
    # Find all .txt files (excluding special files)
    transcript_files = []
    for file_path in base_dir.glob('*.txt'):
        # Skip special files
        if file_path.name in ['requirements.txt', 'EXTRACTION_INSTRUCTIONS.md']:
            continue
        transcript_files.append(file_path)
    
    print(f"Found {len(transcript_files)} transcript files")
    print("Converting to JSONL format...\n")
    
    # Save to JSONL file (one JSON object per line)
    output_file = base_dir / 'transcripts_batch.jsonl'
    processed_count = 0
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for i, file_path in enumerate(transcript_files, 1):
            print(f"Processing {i}/{len(transcript_files)}: {file_path.name}")
            transcript_data = process_transcript_file(file_path)
            if transcript_data:
                # Write each transcript as a single line of JSON
                f.write(json.dumps(transcript_data, ensure_ascii=False) + '\n')
                processed_count += 1
    
    print(f"\n{'='*60}")
    print(f"Conversion complete!")
    print(f"Total episodes processed: {processed_count}")
    print(f"Output saved to: {output_file}")
    print(f"{'='*60}")
    
    # Print sample from the first line
    if processed_count > 0:
        print("\nSample transcript entry (first line):")
        with open(output_file, 'r', encoding='utf-8') as f:
            first_line = f.readline()
            sample = json.loads(first_line)
            # Show truncated text for display
            sample_display = sample.copy()
            if len(sample_display['text']) > 500:
                sample_display['text'] = sample_display['text'][:500] + "... [truncated]"
            print(json.dumps(sample_display, indent=2))

if __name__ == '__main__':
    main()

