#!/usr/bin/env python3
"""
Script to prepare JSONL file for Together.ai batch inference.
Transforms transcript data into the format required by Together.ai Batch API.
"""

import json
import sys
from pathlib import Path

def prepare_batch_file(
    input_file: str,
    output_file: str,
    model: str = "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    max_tokens: int = 4000,
    system_prompt: str = None,
    user_prompt_template: str = None
):
    """
    Transform transcript JSONL to Together.ai batch format.
    
    Args:
        input_file: Path to input JSONL file
        output_file: Path to output JSONL file for batch inference
        model: Model ID to use for inference
        max_tokens: Maximum tokens for response
        system_prompt: Optional system prompt to prepend
        user_prompt_template: Optional template for user message. Use {transcript} as placeholder.
                            If None, transcript is used directly as user content.
    """
    input_path = Path(input_file)
    output_path = Path(output_file)
    
    if not input_path.exists():
        print(f"Error: Input file {input_file} not found")
        return
    
    print(f"Reading from: {input_path}")
    print(f"Writing to: {output_path}")
    print(f"Model: {model}")
    print(f"Max tokens: {max_tokens}")
    print()
    
    processed_count = 0
    skipped_count = 0
    
    with open(input_path, 'r', encoding='utf-8') as infile, \
         open(output_path, 'w', encoding='utf-8') as outfile:
        
        for line_num, line in enumerate(infile, 1):
            try:
                # Parse the input JSON
                data = json.loads(line.strip())
                
                # Get the custom_id (truncate to 64 chars max as per API requirement)
                custom_id = data.get('id', f'episode-{line_num}')
                if len(custom_id) > 64:
                    custom_id = custom_id[:64]
                
                # Get the transcript text
                transcript_text = data.get('text', '')
                
                if not transcript_text:
                    print(f"Warning: Line {line_num} has no text, skipping...")
                    skipped_count += 1
                    continue
                
                # Build messages array
                messages = []
                if system_prompt:
                    messages.append({
                        "role": "system",
                        "content": system_prompt
                    })
                
                # Format user message
                if user_prompt_template:
                    user_content = user_prompt_template.format(transcript=transcript_text)
                else:
                    user_content = transcript_text
                
                messages.append({
                    "role": "user",
                    "content": user_content
                })
                
                # Create the batch request body
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
    print(f"Processed: {processed_count} episodes")
    print(f"Skipped: {skipped_count} episodes")
    print(f"Output file: {output_path}")
    print(f"File size: {output_path.stat().st_size / (1024*1024):.2f} MB")
    print(f"{'='*60}")
    
    # Show sample
    if processed_count > 0:
        print("\nSample batch request (first line):")
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
    input_file = 'transcripts_batch.jsonl'
    output_file = 'together_batch_input.jsonl'
    model = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'  # 50% discount model
    max_tokens = 4000
    system_prompt = None
    user_prompt_template = None
    
    # Allow command line arguments
    # Usage: python prepare_together_batch.py [input] [output] [model] [max_tokens] [system_prompt_file] [user_prompt_template_file]
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    if len(sys.argv) > 3:
        model = sys.argv[3]
    if len(sys.argv) > 4:
        max_tokens = int(sys.argv[4])
    if len(sys.argv) > 5:
        # 5th argument: system prompt file path
        prompt_file = Path(sys.argv[5])
        if prompt_file.exists():
            system_prompt = prompt_file.read_text(encoding='utf-8').strip()
            print(f"Loaded system prompt from: {prompt_file}")
        else:
            print(f"Warning: System prompt file {prompt_file} not found. Using no system prompt.")
    if len(sys.argv) > 6:
        # 6th argument: user prompt template file path
        template_file = Path(sys.argv[6])
        if template_file.exists():
            user_prompt_template = template_file.read_text(encoding='utf-8').strip()
            print(f"Loaded user prompt template from: {template_file}")
        else:
            print(f"Warning: User prompt template file {template_file} not found.")
    
    prepare_batch_file(input_file, output_file, model, max_tokens, system_prompt, user_prompt_template)

