#!/usr/bin/env python3
"""
Script to extract key takeaways and metadata tags from Lenny's Podcast transcripts
using Together.ai reasoning model for better quality extraction.
"""

import os
import json
import re
import time
from pathlib import Path
import requests
from typing import List, Dict, Optional

# Together.ai API configuration
TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"
TOGETHER_MODEL = "pavneet2612_b8db/Qwen/Qwen3-Next-80B-A3B-Thinking-cd128eab"

# Get API key from environment variable
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
if not TOGETHER_API_KEY:
    print("Warning: TOGETHER_API_KEY environment variable not set.")
    print("Please set it with: export TOGETHER_API_KEY='your-api-key'")

def extract_speaker_content(text: str, speaker_name: str) -> str:
    """Extract content from a specific speaker."""
    pattern = rf'{re.escape(speaker_name)}\s*\([^)]+\):\s*(.*?)(?=\n\w+\s*\(|\Z)'
    matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
    return ' '.join(matches)

def filter_guest_content(text: str, guest_name: str) -> str:
    """Extract only content from the guest, excluding Lenny's questions and comments."""
    lines = text.split('\n')
    guest_lines = []
    current_speaker = None
    
    # Common patterns for Lenny's lines
    lenny_patterns = ['lenny', 'lennie', 'host']
    
    for line in lines:
        # Check if line starts with a speaker name (various formats)
        # Format: "Speaker (timestamp): content" or "Speaker: content" or "(timestamp): content"
        speaker_match = re.match(r'^([^:\(]+)(?:\([^)]+\))?:\s*(.*)', line)
        
        if speaker_match:
            speaker = speaker_match.group(1).strip()
            content = speaker_match.group(2).strip()
            
            # Normalize speaker names
            speaker_lower = speaker.lower()
            
            # Skip Lenny's lines (explicit check)
            is_lenny = any(pattern in speaker_lower for pattern in lenny_patterns)
            if is_lenny:
                current_speaker = 'lenny'
                continue
            
            # If we have a guest name, check if this is the guest
            if guest_name:
                guest_name_lower = guest_name.lower()
                # Check if speaker matches guest name (full or partial)
                is_guest = (guest_name_lower in speaker_lower or 
                           any(word.lower() in speaker_lower for word in guest_name.split() if len(word) > 3) or
                           speaker_lower in guest_name_lower)
                
                if is_guest and not is_lenny:
                    current_speaker = 'guest'
                    if content:
                        guest_lines.append(content)
                # If it's not clearly Lenny or guest, assume it's guest if we're already in guest mode
                elif current_speaker == 'guest' and content and not is_lenny:
                    guest_lines.append(content)
            else:
                # No guest name provided - include anything that's not Lenny
                if not is_lenny and content:
                    current_speaker = 'guest'
                    guest_lines.append(content)
        # Continue guest's thought if no new speaker (multi-line responses)
        elif current_speaker == 'guest' and line.strip():
            # Skip if it looks like a new speaker line
            if not re.match(r'^[A-Z][^:]*:\s*', line):
                guest_lines.append(line.strip())
    
    return '\n'.join(guest_lines)

def clean_transcript(text: str, guest_name: str = None) -> str:
    """Clean transcript by removing timestamps, Lenny's content, and keeping only guest content."""
    # First, filter to get only guest content (always filter, even without guest_name)
    text = filter_guest_content(text, guest_name or "")
    
    # Remove any remaining timestamps
    text = re.sub(r'\([^)]*:\d{2}:\d{2}[^)]*\)', '', text)
    # Remove speaker names with timestamps that might remain
    text = re.sub(r'^[^:\(]+(?:\([^)]+\))?:\s*', '', text, flags=re.MULTILINE)
    # Remove sponsor segments (common patterns)
    text = re.sub(r'This episode is brought to you by.*?\.', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Remove Lenny's intro patterns (in case they slipped through)
    text = re.sub(r'Today my guest is.*?\.', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'In our conversation.*?\.', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Remove lines that are clearly from Lenny (questions, intros)
    text = re.sub(r'^.*(?:what|how|why|when|where|tell me|can you|would you).*\?.*$', '', text, flags=re.MULTILINE | re.IGNORECASE)
    # Remove excessive whitespace
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    # Limit length to avoid token limits (keep first 15000 chars)
    if len(text) > 15000:
        text = text[:15000] + "... [truncated]"
    return text.strip()

def extract_metadata_with_ai(transcript: str, episode_name: str, guest_name: str = None) -> Optional[Dict]:
    """
    Use Together.ai API to extract key takeaways and metadata tags.
    """
    if not TOGETHER_API_KEY:
        return None
    
    # Clean the transcript, excluding Lenny's content
    cleaned_transcript = clean_transcript(transcript, guest_name)
    
    # Create the prompt
    guest_context = f"Guest: {guest_name}" if guest_name else "Guest speaker"
    prompt = f"""You are analyzing a podcast transcript from "Lenny's Podcast" about product management and technology. 

Episode: {episode_name}
{guest_context}

IMPORTANT: This transcript contains ONLY the guest's responses and insights. Lenny's questions and comments have been excluded. Focus on extracting insights from the guest's expertise and experience.

Transcript (guest content only):
{cleaned_transcript}

Please analyze this transcript and provide:

1. **3-5 Key Takeaways** - The most important insights, lessons, frameworks, or actionable advice from the GUEST. Each takeaway should be:
   - Specific and concrete (not generic)
   - Actionable or insightful
   - 1-2 sentences long
   - Focused on product management, technology, leadership, or business strategy
   - Based on the guest's actual words and insights, not the host's questions

2. **3-5 Metadata Tags** - Categorize this episode using these possible tags (choose the most relevant):
   - Product Management
   - Leadership
   - Growth
   - Design
   - Engineering
   - Strategy
   - Marketing
   - Data & Analytics
   - Customer Research
   - Startup
   - AI/ML
   - Monetization
   - Hiring
   - Communication
   - Product-Market Fit
   - Experimentation
   - User Experience
   - Team Dynamics
   - Metrics & KPIs
   - Innovation
   - B2B
   - B2C
   - SaaS
   - Marketplace
   - Mobile
   - Web

Please respond in JSON format:
{{
  "key_takeaways": [
    "Takeaway 1",
    "Takeaway 2",
    "Takeaway 3"
  ],
  "metadata_tags": [
    "Tag1",
    "Tag2",
    "Tag3"
  ]
}}"""

    try:
        headers = {
            "Authorization": f"Bearer {TOGETHER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": TOGETHER_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3,
            "max_tokens": 2000
        }
        
        response = requests.post(TOGETHER_API_URL, headers=headers, json=payload, timeout=120)
        response.raise_for_status()
        
        result = response.json()
        
        # Extract the content from the response
        if 'choices' in result and len(result['choices']) > 0:
            content = result['choices'][0]['message']['content']
            
            # Try to extract JSON from the response
            # Look for JSON block in markdown code fences or plain JSON
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
            if json_match:
                content = json_match.group(1)
            else:
                # Try to find JSON object directly
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    content = json_match.group(0)
            
            # Parse JSON
            try:
                extracted_data = json.loads(content)
                return extracted_data
            except json.JSONDecodeError as e:
                print(f"  Warning: Could not parse JSON from response: {e}")
                print(f"  Response content: {content[:500]}")
                return None
        else:
            print(f"  Warning: Unexpected API response format")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"  Error calling API: {e}")
        return None
    except Exception as e:
        print(f"  Unexpected error: {e}")
        return None

def process_transcript(file_path: Path, episode_name: str) -> Optional[Dict]:
    """Process a single transcript file using AI."""
    try:
        print(f"Processing: {episode_name}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract guest name (usually the first speaker that's not "Lenny")
        guest_name = None
        lines = content.split('\n')
        for line in lines[:20]:  # Check first 20 lines
            if ':' in line and 'Lenny' not in line and '(' in line:
                guest_name = line.split('(')[0].strip()
                break
        
        if not guest_name:
            guest_name = episode_name
        
        # Use AI to extract metadata (pass guest_name to exclude Lenny's content)
        ai_result = extract_metadata_with_ai(content, episode_name, guest_name)
        
        if ai_result:
            return {
                'episode_name': episode_name,
                'guest_name': guest_name,
                'key_takeaways': ai_result.get('key_takeaways', [])[:5],
                'metadata_tags': ai_result.get('metadata_tags', [])[:5],
                'file_path': str(file_path)
            }
        else:
            print(f"  Failed to extract metadata with AI, skipping...")
            return None
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def main():
    """Main function to process all transcripts."""
    if not TOGETHER_API_KEY:
        print("ERROR: TOGETHER_API_KEY environment variable is not set.")
        print("Please set it with: export TOGETHER_API_KEY='your-api-key'")
        return
    
    base_dir = Path(__file__).parent
    transcript_files = list(base_dir.glob('*.txt'))
    
    # Filter out special files
    transcript_files = [f for f in transcript_files if f.name not in ['extract_metadata.py', 'extract_metadata_ai.py']]
    
    print(f"Found {len(transcript_files)} transcript files")
    print(f"Using Together.ai model: {TOGETHER_MODEL}")
    print(f"Processing will take some time due to API calls...\n")
    
    # Load existing metadata if it exists (for resuming)
    output_file = base_dir / 'episodes_metadata.json'
    existing_episodes = {}
    if output_file.exists():
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                if 'episodes' in existing_data:
                    for ep in existing_data['episodes']:
                        existing_episodes[ep['episode_name']] = ep
            print(f"Loaded {len(existing_episodes)} existing episodes (will skip if already processed)")
        except:
            pass
    
    episodes = []
    processed_count = 0
    skipped_count = 0
    failed_count = 0
    
    for i, file_path in enumerate(transcript_files, 1):
        episode_name = file_path.stem
        
        # Skip if already processed
        if episode_name in existing_episodes:
            print(f"[{i}/{len(transcript_files)}] Skipping (already processed): {episode_name}")
            episodes.append(existing_episodes[episode_name])
            skipped_count += 1
            continue
        
        print(f"[{i}/{len(transcript_files)}] Processing: {episode_name}")
        
        episode_data = process_transcript(file_path, episode_name)
        
        if episode_data:
            episodes.append(episode_data)
            processed_count += 1
            
            # Save incrementally every 10 episodes
            if processed_count % 10 == 0:
                metadata = {
                    'total_episodes': len(episodes),
                    'episodes': episodes
                }
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, indent=2, ensure_ascii=False)
                print(f"  Saved progress ({processed_count} new episodes processed)")
        else:
            failed_count += 1
        
        # Rate limiting - wait between requests to avoid hitting rate limits
        if i < len(transcript_files):
            time.sleep(1)  # 1 second delay between requests
    
    # Final save
    metadata = {
        'total_episodes': len(episodes),
        'episodes': episodes
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"Processing complete!")
    print(f"Total episodes: {len(episodes)}")
    print(f"Newly processed: {processed_count}")
    print(f"Skipped (already processed): {skipped_count}")
    print(f"Failed: {failed_count}")
    print(f"Metadata saved to {output_file}")
    print(f"{'='*60}")
    
    # Print sample
    if episodes:
        print("\nSample episode data:")
        sample = episodes[0]
        print(json.dumps(sample, indent=2))

if __name__ == '__main__':
    main()

