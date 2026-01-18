# AI-Powered Metadata Extraction Instructions

This guide explains how to use the Together.ai API to extract high-quality key takeaways and metadata tags from podcast transcripts.

## Setup

### 1. Install Dependencies

```bash
pip3 install requests
```

Or install from requirements.txt:
```bash
pip3 install -r requirements.txt
```

### 2. Set Your API Key

Set the Together.ai API key as an environment variable:

```bash
export TOGETHER_API_KEY='your-api-key-here'
```

To make it permanent, add it to your `~/.zshrc` or `~/.bashrc`:
```bash
echo 'export TOGETHER_API_KEY="your-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Test the Connection

First, test with a single episode to verify everything works:

```bash
python3 test_ai_extraction.py
```

This will process one episode and show you the extracted metadata. If it looks good, proceed to the full extraction.

## Running the Full Extraction

### Process All Episodes

```bash
python3 extract_metadata_ai.py
```

**Important Notes:**
- This will process all 298 episodes, which will take time (approximately 5-10 minutes per episode depending on API response time)
- The script saves progress incrementally every 10 episodes, so you can stop and resume
- If an episode is already processed, it will be skipped (useful for resuming)
- There's a 1-second delay between requests to avoid rate limiting

### Resume After Interruption

If the script stops (Ctrl+C or error), you can simply run it again. It will:
- Load existing episodes from `episodes_metadata.json`
- Skip episodes that are already processed
- Continue with remaining episodes

## What Gets Extracted

For each episode, the AI model extracts:

1. **3-5 Key Takeaways**: 
   - Specific, actionable insights
   - Lessons, frameworks, or strategies
   - Focused on product/tech/leadership topics
   - 1-2 sentences each

2. **3-5 Metadata Tags**:
   - Categorized from a predefined list
   - Based on episode themes and content
   - Used for graph connections

## Output

The script generates/updates `episodes_metadata.json` with:
- Episode name and guest
- Key takeaways (AI-extracted)
- Metadata tags (AI-extracted)
- File path reference

## Troubleshooting

### API Key Issues
- Make sure `TOGETHER_API_KEY` is set: `echo $TOGETHER_API_KEY`
- Verify the key is correct and has sufficient credits

### Rate Limiting
- The script includes a 1-second delay between requests
- If you hit rate limits, increase the delay in `extract_metadata_ai.py` (line ~200)

### JSON Parsing Errors
- The script tries to extract JSON from the AI response
- If parsing fails, it will skip that episode and continue
- Check the console output for specific errors

### Long Processing Time
- 298 episodes × ~5-10 seconds each = ~25-50 minutes total
- The script saves progress every 10 episodes
- You can stop (Ctrl+C) and resume anytime

## Cost Estimation

- Each API call processes one episode
- 298 episodes total
- Check Together.ai pricing for your model to estimate costs

## After Extraction

Once extraction is complete:
1. The `episodes_metadata.json` file will be updated
2. Refresh your browser with `graph_visualization.html` to see the improved metadata
3. The graph will show better connections based on AI-extracted tags

