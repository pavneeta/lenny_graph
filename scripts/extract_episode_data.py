#!/usr/bin/env python3
"""
Script to extract custom_id, key insights, takeaways, and metadata tags
from JSONL file and metadata, outputting to a single file.
"""

import json
import sys
from pathlib import Path

def load_metadata(metadata_file: str):
    """Load metadata from JSON file."""
    metadata_path = Path(metadata_file)
    if not metadata_path.exists():
        print(f"Warning: Metadata file {metadata_file} not found. Continuing without metadata.")
        return {}
    
    with open(metadata_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create a lookup dictionary by episode_name
    metadata_lookup = {}
    for episode in data.get('episodes', []):
        episode_name = episode.get('episode_name', '')
        if episode_name:
            metadata_lookup[episode_name] = {
                'key_takeaways': episode.get('key_takeaways', []),
                'metadata_tags': episode.get('metadata_tags', [])
            }
    
    return metadata_lookup

def extract_episode_data(
    input_jsonl: str,
    output_file: str,
    metadata_file: str = None,
    output_format: str = 'jsonl'
):
    """
    Extract custom_id, key insights, takeaways, and metadata tags.
    
    Args:
        input_jsonl: Path to input JSONL file
        output_file: Path to output file
        metadata_file: Optional path to metadata JSON file
        output_format: 'jsonl' or 'json'
    """
    input_path = Path(input_jsonl)
    output_path = Path(output_file)
    
    if not input_path.exists():
        print(f"Error: Input file {input_jsonl} not found")
        return
    
    # Load metadata if provided
    metadata_lookup = {}
    if metadata_file:
        metadata_lookup = load_metadata(metadata_file)
        print(f"Loaded metadata for {len(metadata_lookup)} episodes")
    
    print(f"Reading from: {input_path}")
    print(f"Writing to: {output_path}")
    print()
    
    episodes_data = []
    processed_count = 0
    skipped_count = 0
    
    with open(input_path, 'r', encoding='utf-8') as infile:
        for line_num, line in enumerate(infile, 1):
            try:
                # Parse the JSON line
                data = json.loads(line.strip())
                
                # Get custom_id
                custom_id = data.get('custom_id', f'episode-{line_num}')
                
                # Get metadata for this episode
                episode_metadata = metadata_lookup.get(custom_id, {})
                
                # Extract the fields
                episode_data = {
                    "custom_id": custom_id,
                    "key_insights": episode_metadata.get('key_takeaways', []),  # Using takeaways as insights
                    "takeaways": episode_metadata.get('key_takeaways', []),
                    "metadata_tags": episode_metadata.get('metadata_tags', [])
                }
                
                episodes_data.append(episode_data)
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
    
    # Write output file
    if output_format.lower() == 'jsonl':
        # Write as JSONL (one JSON object per line)
        with open(output_path, 'w', encoding='utf-8') as outfile:
            for episode in episodes_data:
                outfile.write(json.dumps(episode, ensure_ascii=False) + '\n')
    else:
        # Write as JSON array
        output_data = {
            "total_episodes": len(episodes_data),
            "episodes": episodes_data
        }
        with open(output_path, 'w', encoding='utf-8') as outfile:
            json.dump(output_data, outfile, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"Extraction complete!")
    print(f"Processed: {processed_count} episodes")
    print(f"Skipped: {skipped_count} episodes")
    print(f"Output file: {output_path}")
    print(f"Format: {output_format.upper()}")
    print(f"{'='*60}")
    
    # Show sample
    if episodes_data:
        print("\nSample episode data:")
        sample = episodes_data[0]
        print(json.dumps(sample, indent=2))

if __name__ == '__main__':
    input_jsonl = 'together_batch_input.jsonl'
    output_file = 'episodes_extracted.jsonl'
    metadata_file = 'episodes_metadata.json'
    output_format = 'jsonl'
    
    # Allow command line arguments
    # Usage: python extract_episode_data.py [input_jsonl] [output_file] [metadata_file] [format]
    if len(sys.argv) > 1:
        input_jsonl = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    if len(sys.argv) > 3:
        metadata_file = sys.argv[3]
    if len(sys.argv) > 4:
        output_format = sys.argv[4]
    
    extract_episode_data(input_jsonl, output_file, metadata_file, output_format)

