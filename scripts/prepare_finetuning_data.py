#!/usr/bin/env python3
"""
Prepare fine-tuning data from Lenny's Podcast transcripts for Together.ai.

This script:
1. Reads all transcript .txt files
2. Processes them into instruction-completion pairs
3. Splits into training and validation sets
4. Saves as JSONL files in Together.ai format
"""

import json
import re
import random
from pathlib import Path
from typing import List, Dict, Tuple
from collections import defaultdict

# Set random seed for reproducibility
random.seed(42)

def clean_transcript_text(text: str) -> str:
    """Clean transcript text by removing timestamps and normalizing whitespace."""
    # Remove timestamps like (00:00:00)
    text = re.sub(r'\(\d{2}:\d{2}:\d{2}\)', '', text)
    # Remove speaker labels with timestamps at start of lines (e.g., "Ada Chen Rekhi (00:00:00):")
    text = re.sub(r'^[A-Za-z\s&\.]+ \(00:00:00\):', '', text, flags=re.MULTILINE)
    # Remove standalone speaker labels at start of lines (e.g., "Ryan Singer :" or "Lenny Rachitsky :")
    text = re.sub(r'^[A-Za-z\s&\.]+ :\s*', '', text, flags=re.MULTILINE)
    # Remove lines that are just ":" or timestamps
    text = re.sub(r'^:\s*$', '', text, flags=re.MULTILINE)
    # Remove lines that are just timestamps
    text = re.sub(r'^\(\d{2}:\d{2}:\d{2}\):\s*$', '', text, flags=re.MULTILINE)
    # Normalize whitespace
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)  # Multiple newlines to double
    text = re.sub(r'[ \t]+', ' ', text)  # Multiple spaces to single
    # Remove leading/trailing whitespace from each line
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join([line for line in lines if line])  # Remove empty lines
    return text.strip()

def extract_conversation_chunks(transcript: str, min_length: int = 200, max_length: int = 2000) -> List[str]:
    """
    Extract meaningful conversation chunks from transcript.
    Splits on double newlines and creates chunks of appropriate length.
    """
    # Split by paragraphs (double newlines)
    paragraphs = [p.strip() for p in transcript.split('\n\n') if p.strip()]
    
    chunks = []
    current_chunk = []
    current_length = 0
    
    for para in paragraphs:
        para_length = len(para)
        
        # If adding this paragraph would exceed max_length, save current chunk
        if current_length + para_length > max_length and current_chunk:
            chunk_text = '\n\n'.join(current_chunk)
            if len(chunk_text) >= min_length:
                chunks.append(chunk_text)
            current_chunk = [para]
            current_length = para_length
        else:
            current_chunk.append(para)
            current_length += para_length + 2  # +2 for '\n\n'
    
    # Add final chunk if it meets minimum length
    if current_chunk:
        chunk_text = '\n\n'.join(current_chunk)
        if len(chunk_text) >= min_length:
            chunks.append(chunk_text)
    
    return chunks

def create_instruction_prompts(chunk: str, episode_name: str) -> List[Dict[str, str]]:
    """
    Create instruction-completion pairs from a transcript chunk.
    Returns multiple prompt variations for better training data diversity.
    """
    examples = []
    
    # Clean the chunk
    cleaned_chunk = clean_transcript_text(chunk)
    
    # Create different prompt styles for variety
    prompt_templates = [
        f"Based on insights from Lenny's Podcast episode with {episode_name}, share key product management advice and frameworks discussed.",
        f"What are the main product management insights from this conversation with {episode_name}?",
        f"Summarize the product strategy and growth insights from Lenny's conversation with {episode_name}.",
        f"Extract and explain the key product management frameworks and lessons from this podcast episode with {episode_name}.",
        f"What product management wisdom can we learn from {episode_name}'s experience?",
    ]
    
    # Use the first prompt template (can be randomized if desired)
    prompt = prompt_templates[0]
    
    examples.append({
        "prompt": prompt,
        "completion": cleaned_chunk
    })
    
    return examples

def process_transcript_file(file_path: Path) -> List[Dict[str, str]]:
    """Process a single transcript file into instruction-completion pairs."""
    try:
        episode_name = file_path.stem
        
        # Read the transcript
        with open(file_path, 'r', encoding='utf-8') as f:
            transcript = f.read()
        
        # Skip if transcript is too short
        if len(transcript) < 500:
            return []
        
        # Extract conversation chunks
        chunks = extract_conversation_chunks(transcript)
        
        # Create instruction-completion pairs
        examples = []
        for chunk in chunks:
            examples.extend(create_instruction_prompts(chunk, episode_name))
        
        return examples
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return []

def prepare_finetuning_data(
    transcript_dir: str = ".",
    train_output: str = "train_data.jsonl",
    val_output: str = "val_data.jsonl",
    val_split: float = 0.1,
    min_chunk_length: int = 200,
    max_chunk_length: int = 2000
):
    """
    Prepare fine-tuning data from transcript files.
    
    Args:
        transcript_dir: Directory containing transcript .txt files
        train_output: Output file for training data
        val_output: Output file for validation data
        val_split: Fraction of data to use for validation (0.0 to 1.0)
        min_chunk_length: Minimum length for transcript chunks
        max_chunk_length: Maximum length for transcript chunks
    """
    base_dir = Path(transcript_dir)
    train_path = Path(train_output)
    val_path = Path(val_output)
    
    # Find all .txt transcript files
    transcript_files = []
    skip_files = {
        'requirements.txt',
        'EXTRACTION_INSTRUCTIONS.md',
        'example_system_prompt.txt',
        'example_user_prompt_template.txt',
        'Interview Q Compilation.txt',
        'Teaser_2021.txt',
        'EOY Review.txt',
        'Failure.txt'
    }
    
    for file_path in base_dir.glob('*.txt'):
        if file_path.name not in skip_files:
            transcript_files.append(file_path)
    
    print(f"Found {len(transcript_files)} transcript files")
    print(f"Processing transcripts...\n")
    
    # Process all transcripts
    all_examples = []
    processed_count = 0
    skipped_count = 0
    
    for i, file_path in enumerate(transcript_files, 1):
        print(f"Processing {i}/{len(transcript_files)}: {file_path.name}")
        examples = process_transcript_file(file_path)
        
        if examples:
            all_examples.extend(examples)
            processed_count += 1
        else:
            skipped_count += 1
        
        if processed_count % 50 == 0:
            print(f"  → Processed {processed_count} episodes, {len(all_examples)} examples so far...")
    
    print(f"\nTotal examples created: {len(all_examples)}")
    
    # Shuffle examples
    random.shuffle(all_examples)
    
    # Split into train and validation
    split_idx = int(len(all_examples) * (1 - val_split))
    train_examples = all_examples[:split_idx]
    val_examples = all_examples[split_idx:]
    
    print(f"Training examples: {len(train_examples)}")
    print(f"Validation examples: {len(val_examples)}")
    
    # Write training data
    print(f"\nWriting training data to: {train_path}")
    with open(train_path, 'w', encoding='utf-8') as f:
        for example in train_examples:
            f.write(json.dumps(example, ensure_ascii=False) + '\n')
    
    # Write validation data
    print(f"Writing validation data to: {val_path}")
    with open(val_path, 'w', encoding='utf-8') as f:
        for example in val_examples:
            f.write(json.dumps(example, ensure_ascii=False) + '\n')
    
    print(f"\n{'='*60}")
    print(f"Fine-tuning data preparation complete!")
    print(f"Processed episodes: {processed_count}")
    print(f"Skipped episodes: {skipped_count}")
    print(f"Training examples: {len(train_examples)}")
    print(f"Validation examples: {len(val_examples)}")
    print(f"Training file: {train_path} ({train_path.stat().st_size / (1024*1024):.2f} MB)")
    print(f"Validation file: {val_path} ({val_path.stat().st_size / (1024*1024):.2f} MB)")
    print(f"{'='*60}")
    
    # Show sample
    if train_examples:
        print("\nSample training example:")
        sample = train_examples[0].copy()
        if len(sample['completion']) > 300:
            sample['completion'] = sample['completion'][:300] + "... [truncated]"
        print(json.dumps(sample, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    import sys
    
    # Default values
    transcript_dir = "."
    train_output = "train_data.jsonl"
    val_output = "val_data.jsonl"
    val_split = 0.1
    
    # Allow command line arguments
    if len(sys.argv) > 1:
        transcript_dir = sys.argv[1]
    if len(sys.argv) > 2:
        train_output = sys.argv[2]
    if len(sys.argv) > 3:
        val_output = sys.argv[3]
    if len(sys.argv) > 4:
        val_split = float(sys.argv[4])
    
    prepare_finetuning_data(
        transcript_dir=transcript_dir,
        train_output=train_output,
        val_output=val_output,
        val_split=val_split
    )

