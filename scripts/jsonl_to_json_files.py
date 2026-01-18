#!/usr/bin/env python3
"""
Script to convert JSONL file to individual JSON files (one per episode).
"""

import json
import sys
from pathlib import Path
import re

def sanitize_filename(filename):
    """Sanitize filename to be filesystem-safe."""
    # Remove or replace invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Remove leading/trailing spaces and dots
    filename = filename.strip(' .')
    # Limit length
    if len(filename) > 200:
        filename = filename[:200]
    return filename

def jsonl_to_json_files(input_file: str, output_dir: str = "episodes_json"):
    """
    Convert JSONL file to individual JSON files.
    
    Args:
        input_file: Path to input JSONL file
        output_dir: Directory to save JSON files
    """
    input_path = Path(input_file)
    output_path = Path(output_dir)
    
    if not input_path.exists():
        print(f"Error: Input file {input_file} not found")
        return
    
    # Create output directory if it doesn't exist
    output_path.mkdir(exist_ok=True)
    
    print(f"Reading from: {input_path}")
    print(f"Writing to: {output_path}/")
    print()
    
    processed_count = 0
    skipped_count = 0
    
    with open(input_path, 'r', encoding='utf-8') as infile:
        for line_num, line in enumerate(infile, 1):
            try:
                # Parse the JSON line
                data = json.loads(line.strip())
                
                # Get the custom_id or episode identifier
                episode_id = data.get('custom_id', f'episode-{line_num}')
                
                # Sanitize the filename
                safe_filename = sanitize_filename(episode_id)
                json_filename = f"{safe_filename}.json"
                json_filepath = output_path / json_filename
                
                # Write individual JSON file with pretty formatting
                with open(json_filepath, 'w', encoding='utf-8') as outfile:
                    json.dump(data, outfile, indent=2, ensure_ascii=False)
                
                processed_count += 1
                
                if processed_count % 50 == 0:
                    print(f"Processed {processed_count} episodes...")
                    
            except json.JSONDecodeError as e:
                print(f"Error parsing line {line_num}: {e}")
                skipped_count += 1
                continue
            except Exception as e:
                print(f"Error processing line {line_num}: {e}")
                skipped_count += 1
                continue
    
    print(f"\n{'='*60}")
    print(f"Conversion complete!")
    print(f"Processed: {processed_count} JSON files")
    print(f"Skipped: {skipped_count} episodes")
    print(f"Output directory: {output_path}")
    print(f"{'='*60}")
    
    # Show sample filenames
    if processed_count > 0:
        print("\nSample files created:")
        json_files = sorted(list(output_path.glob("*.json")))[:5]
        for json_file in json_files:
            print(f"  - {json_file.name}")

if __name__ == '__main__':
    input_file = 'together_batch_input.jsonl'
    output_dir = 'episodes_json'
    
    # Allow command line arguments
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_dir = sys.argv[2]
    
    jsonl_to_json_files(input_file, output_dir)

