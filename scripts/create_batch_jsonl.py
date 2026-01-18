#!/usr/bin/env python3
"""
Create a single JSONL file for Together.ai batch inference.
Reads all transcript .txt files and creates batch-ready JSONL format.
"""

import json
import sys
from pathlib import Path

def load_system_prompt(prompt_file: str) -> str:
    """Load system prompt from file."""
    prompt_path = Path(prompt_file)
    if not prompt_path.exists():
        print(f"Error: System prompt file {prompt_file} not found")
        sys.exit(1)
    
    # Read the prompt (it's stored as text, not JSON)
    with open(prompt_path, 'r', encoding='utf-8') as f:
        prompt = f.read().strip()
    
    return prompt

def process_transcript_file(file_path: Path) -> dict:
    """Process a single transcript file."""
    try:
        episode_name = file_path.stem
        
        # Read the full transcript
        with open(file_path, 'r', encoding='utf-8') as f:
            transcript_text = f.read()
        
        return {
            "episode_name": episode_name,
            "transcript": transcript_text
        }
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def create_batch_jsonl(
    transcript_dir: str = ".",
    system_prompt_file: str = "system_prompt_lennygraph.json",
    output_file: str = "batch_inference.jsonl",
    model: str = "Qwen/Qwen3-Next-80B-A3B-Thinking",
    max_tokens: int = 4000
):
    """
    Create JSONL file for Together.ai batch inference.
    
    Args:
        transcript_dir: Directory containing transcript .txt files
        system_prompt_file: Path to system prompt file
        output_file: Output JSONL file path
        model: Model ID for Together.ai
        max_tokens: Maximum tokens for response
    """
    base_dir = Path(transcript_dir)
    output_path = Path(output_file)
    
    # Load system prompt
    print(f"Loading system prompt from: {system_prompt_file}")
    system_prompt = load_system_prompt(system_prompt_file)
    print(f"System prompt loaded ({len(system_prompt)} characters)\n")
    
    # Find all .txt transcript files
    transcript_files = []
    skip_files = [
        'requirements.txt', 
        'EXTRACTION_INSTRUCTIONS.md',
        'example_system_prompt.txt',
        'example_user_prompt_template.txt'
    ]
    for file_path in base_dir.glob('*.txt'):
        # Skip special files
        if file_path.name in skip_files:
            continue
        transcript_files.append(file_path)
    
    print(f"Found {len(transcript_files)} transcript files")
    print(f"Creating batch JSONL file: {output_path}")
    print(f"Model: {model}")
    print(f"Max tokens: {max_tokens}\n")
    
    processed_count = 0
    skipped_count = 0
    
    with open(output_path, 'w', encoding='utf-8') as outfile:
        for i, file_path in enumerate(transcript_files, 1):
            print(f"Processing {i}/{len(transcript_files)}: {file_path.name}")
            
            # Process transcript
            episode_data = process_transcript_file(file_path)
            if not episode_data:
                skipped_count += 1
                continue
            
            episode_name = episode_data['episode_name']
            transcript_text = episode_data['transcript']
            
            # Create custom_id (truncate to 64 chars max for Together.ai)
            custom_id = episode_name
            if len(custom_id) > 64:
                custom_id = custom_id[:64]
            
            # Build messages array
            messages = [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": transcript_text
                }
            ]
            
            # Create batch request
            batch_request = {
                "custom_id": custom_id,
                "body": {
                    "model": model,
                    "messages": messages,
                    "max_tokens": max_tokens
                }
            }
            
            # Write as JSON line
            outfile.write(json.dumps(batch_request, ensure_ascii=False) + '\n')
            processed_count += 1
            
            if processed_count % 50 == 0:
                print(f"  → Processed {processed_count} episodes...")
    
    print(f"\n{'='*60}")
    print(f"Batch JSONL creation complete!")
    print(f"Processed: {processed_count} episodes")
    print(f"Skipped: {skipped_count} episodes")
    print(f"Output file: {output_path}")
    print(f"File size: {output_path.stat().st_size / (1024*1024):.2f} MB")
    print(f"{'='*60}")
    
    # Show sample
    if processed_count > 0:
        print("\nSample batch request (first entry):")
        with open(output_path, 'r', encoding='utf-8') as f:
            first_line = f.readline()
            sample = json.loads(first_line)
            # Truncate content for display
            if 'body' in sample and 'messages' in sample['body']:
                for msg in sample['body']['messages']:
                    if 'content' in msg and len(msg['content']) > 200:
                        msg['content'] = msg['content'][:200] + "... [truncated]"
            print(json.dumps(sample, indent=2))

if __name__ == '__main__':
    # Default values
    transcript_dir = "."
    system_prompt_file = "system_prompt_lennygraph.json"
    output_file = "batch_inference.jsonl"
    model = "Qwen/Qwen3-Next-80B-A3B-Thinking"
    max_tokens = 4000
    
    # Allow command line arguments
    # Usage: python create_batch_jsonl.py [transcript_dir] [prompt_file] [output_file] [model] [max_tokens]
    if len(sys.argv) > 1:
        transcript_dir = sys.argv[1]
    if len(sys.argv) > 2:
        system_prompt_file = sys.argv[2]
    if len(sys.argv) > 3:
        output_file = sys.argv[3]
    if len(sys.argv) > 4:
        model = sys.argv[4]
    if len(sys.argv) > 5:
        max_tokens = int(sys.argv[5])
    
    create_batch_jsonl(transcript_dir, system_prompt_file, output_file, model, max_tokens)

