#!/usr/bin/env python3
"""
Script to extract key takeaways and metadata tags from Lenny's Podcast transcripts.
"""

import os
import json
import re
from pathlib import Path
from collections import Counter
import random

# Common product/tech themes for tagging
THEME_KEYWORDS = {
    'Product Management': ['product manager', 'product management', 'roadmap', 'prioritization', 'feature', 'PM'],
    'Leadership': ['leadership', 'CEO', 'founder', 'team', 'culture', 'organization', 'management'],
    'Growth': ['growth', 'acquisition', 'retention', 'metrics', 'conversion', 'funnel'],
    'Design': ['design', 'UX', 'user experience', 'interface', 'aesthetic', 'visual'],
    'Engineering': ['engineering', 'technical', 'architecture', 'code', 'development', 'infrastructure'],
    'Strategy': ['strategy', 'vision', 'mission', 'goals', 'planning', 'roadmap'],
    'Marketing': ['marketing', 'brand', 'advertising', 'campaign', 'distribution', 'messaging'],
    'Data & Analytics': ['data', 'analytics', 'metrics', 'experiment', 'A/B test', 'measurement'],
    'Customer Research': ['customer', 'user research', 'interview', 'feedback', 'insights'],
    'Startup': ['startup', 'founder', 'early stage', 'venture', 'funding', 'scaling'],
    'AI/ML': ['AI', 'machine learning', 'artificial intelligence', 'ML', 'model', 'algorithm'],
    'Monetization': ['revenue', 'pricing', 'monetization', 'business model', 'profit'],
    'Hiring': ['hiring', 'recruiting', 'talent', 'team building', 'interview'],
    'Communication': ['communication', 'storytelling', 'presentation', 'writing', 'narrative'],
    'Product-Market Fit': ['product-market fit', 'PMF', 'validation', 'market'],
    'Experimentation': ['experiment', 'testing', 'hypothesis', 'validation', 'A/B test'],
    'User Experience': ['UX', 'user experience', 'usability', 'interface', 'interaction'],
    'Team Dynamics': ['team', 'collaboration', 'conflict', 'culture', 'dynamics'],
    'Metrics & KPIs': ['metrics', 'KPI', 'OKR', 'measurement', 'dashboard'],
    'Innovation': ['innovation', 'disruption', 'breakthrough', 'novel', 'creative']
}

def extract_speaker_content(text, speaker_name):
    """Extract content from a specific speaker."""
    pattern = rf'{re.escape(speaker_name)}\s*\([^)]+\):\s*(.*?)(?=\n\w+\s*\(|\Z)'
    matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
    return ' '.join(matches)

def extract_key_takeaways(text, episode_name, num_takeaways=5):
    """
    Extract key takeaways from transcript.
    This is a simplified version - in production, you'd use NLP/LLM.
    """
    # Remove timestamps and speaker names for analysis
    cleaned = re.sub(r'\([^)]+\):', '', text)
    cleaned = re.sub(r'\([^)]+\)', '', cleaned)
    
    # Find sentences that seem like insights (contain certain keywords)
    insight_keywords = [
        'important', 'key', 'critical', 'essential', 'should', 'must', 'need to',
        'learned', 'discovered', 'realized', 'found that', 'the key', 'the most',
        'principle', 'framework', 'strategy', 'approach', 'method', 'way to',
        'difference between', 'better', 'best', 'effective', 'successful'
    ]
    
    sentences = re.split(r'[.!?]+', cleaned)
    potential_insights = []
    
    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) < 30 or len(sentence) > 300:  # Filter by length
            continue
        
        # Check if sentence contains insight keywords
        if any(keyword in sentence.lower() for keyword in insight_keywords):
            # Prioritize sentences from guest speakers (not Lenny's intro)
            if not sentence.startswith('This episode') and not sentence.startswith('Today my guest'):
                potential_insights.append(sentence)
    
    # Also look for numbered lists or bullet points
    list_pattern = r'(?:^|\n)\s*(?:\d+\.|[-*])\s+([^\n]+)'
    list_items = re.findall(list_pattern, text, re.MULTILINE)
    potential_insights.extend(list_items)
    
    # Remove duplicates and select top insights
    unique_insights = []
    seen = set()
    for insight in potential_insights:
        insight_clean = insight.strip()[:200]  # Limit length
        if insight_clean and insight_clean.lower() not in seen:
            seen.add(insight_clean.lower())
            unique_insights.append(insight_clean)
    
    # Return top N takeaways
    return unique_insights[:num_takeaways] if len(unique_insights) >= num_takeaways else unique_insights

def extract_metadata_tags(text, episode_name, num_tags=5):
    """Extract metadata tags based on themes and keywords."""
    text_lower = text.lower()
    tag_scores = {}
    
    # Score each theme based on keyword frequency
    for theme, keywords in THEME_KEYWORDS.items():
        score = sum(text_lower.count(keyword.lower()) for keyword in keywords)
        if score > 0:
            tag_scores[theme] = score
    
    # Get top scoring themes
    sorted_tags = sorted(tag_scores.items(), key=lambda x: x[1], reverse=True)
    top_tags = [theme for theme, score in sorted_tags[:num_tags]]
    
    # If we don't have enough tags, add some based on episode name or content
    if len(top_tags) < num_tags:
        # Check for specific topics in text
        additional_keywords = {
            'B2B': ['B2B', 'enterprise', 'business to business'],
            'B2C': ['consumer', 'B2C', 'end user'],
            'SaaS': ['SaaS', 'software as a service', 'subscription'],
            'Marketplace': ['marketplace', 'platform', 'two-sided'],
            'Mobile': ['mobile', 'iOS', 'Android', 'app'],
            'Web': ['web', 'website', 'browser'],
        }
        
        for tag, keywords in additional_keywords.items():
            if any(kw in text_lower for kw in keywords) and tag not in top_tags:
                top_tags.append(tag)
                if len(top_tags) >= num_tags:
                    break
    
    return top_tags[:num_tags]

def process_transcript(file_path):
    """Process a single transcript file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        episode_name = Path(file_path).stem
        
        # Extract guest name (usually the first speaker that's not "Lenny")
        guest_name = None
        lines = content.split('\n')
        for line in lines[:20]:  # Check first 20 lines
            if ':' in line and 'Lenny' not in line and '(' in line:
                guest_name = line.split('(')[0].strip()
                break
        
        if not guest_name:
            guest_name = episode_name
        
        # Extract key takeaways
        takeaways = extract_key_takeaways(content, episode_name)
        
        # If we don't have enough takeaways, generate placeholder ones
        if len(takeaways) < 3:
            takeaways.extend([
                f"Insights on {episode_name}'s approach to product and technology",
                f"Key lessons from {episode_name}'s experience",
                f"Practical advice for product and tech leaders"
            ])
        
        # Extract metadata tags
        tags = extract_metadata_tags(content, episode_name)
        
        # Ensure we have at least 3 tags
        if len(tags) < 3:
            tags.extend(['Product Management', 'Leadership', 'Strategy'])
        
        return {
            'episode_name': episode_name,
            'guest_name': guest_name,
            'key_takeaways': takeaways[:5],
            'metadata_tags': tags[:5],
            'file_path': str(file_path)
        }
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def main():
    """Main function to process all transcripts."""
    base_dir = Path(__file__).parent
    transcript_files = list(base_dir.glob('*.txt'))
    
    # Filter out special files
    transcript_files = [f for f in transcript_files if f.name not in ['extract_metadata.py']]
    
    print(f"Found {len(transcript_files)} transcript files")
    
    episodes = []
    for i, file_path in enumerate(transcript_files, 1):
        print(f"Processing {i}/{len(transcript_files)}: {file_path.name}")
        episode_data = process_transcript(file_path)
        if episode_data:
            episodes.append(episode_data)
    
    # Create metadata repository
    metadata = {
        'total_episodes': len(episodes),
        'episodes': episodes
    }
    
    # Save to JSON
    output_file = base_dir / 'episodes_metadata.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"\nProcessed {len(episodes)} episodes")
    print(f"Metadata saved to {output_file}")
    
    # Print sample
    if episodes:
        print("\nSample episode data:")
        sample = episodes[0]
        print(json.dumps(sample, indent=2))

if __name__ == '__main__':
    main()

