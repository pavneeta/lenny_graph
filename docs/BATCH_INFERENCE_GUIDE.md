# Together.ai Batch Inference Guide

## Files Created

- **`together_batch_input.jsonl`**: Ready-to-use batch file for Together.ai Batch API
- **`prepare_together_batch.py`**: Script to regenerate the batch file if needed

## File Format

Each line in `together_batch_input.jsonl` follows the Together.ai batch format:

```json
{
  "custom_id": "episode-id",
  "body": {
    "model": "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    "messages": [
      {
        "role": "user",
        "content": "transcript text..."
      }
    ],
    "max_tokens": 4000
  }
}
```

## Statistics

- **Total episodes**: 298
- **File size**: ~24 MB (well under 100MB limit)
- **Model**: `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo` (50% discount)
- **Max tokens**: 4000 per request

## Using with Together.ai Batch API

### 1. Upload the batch file

```python
from together import Together

client = Together()

# Upload batch job file
file_resp = client.files.upload(
    file="together_batch_input.jsonl",
    purpose="batch-api",
    check=False
)

print(f"File ID: {file_resp.id}")
```

### 2. Create the batch

```python
file_id = file_resp.id

batch = client.batches.create_batch(
    file_id,
    endpoint="/v1/chat/completions"
)

print(f"Batch ID: {batch.id}")
print(f"Status: {batch.status}")
```

### 3. Check batch status

```python
batch_stat = client.batches.get_batch(batch.id)
print(f"Status: {batch_stat.status}")
# Status can be: VALIDATING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED
```

### 4. Retrieve results (when completed)

```python
batch = client.batches.get_batch("batch-xyz789")

if batch.status == "COMPLETED":
    # Download the output file
    client.files.retrieve_content(
        id=batch.output_file_id,
        output="batch_output.jsonl",
    )
```

## Rate Limits

- **Max tokens per model**: 30B tokens can be enqueued per model
- **Per-batch limits**: Up to 50,000 requests per batch (we have 298)
- **Batch file size**: Maximum 100MB (our file is ~24MB)
- **Separate pool**: Batch API doesn't consume standard rate limits

## Model Selection

The default model is `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo` which offers a **50% discount** for batch processing.

Other models with 50% discount include:
- `deepseek-ai/DeepSeek-V3`
- `meta-llama/Llama-3-70b-chat-hf`
- `Qwen/Qwen2.5-72B-Instruct-Turbo`
- And more (see [Together.ai docs](https://docs.together.ai/docs/batch-inference))

To use a different model, modify `prepare_together_batch.py` or pass it as an argument:

```bash
python3 prepare_together_batch.py transcripts_batch.jsonl together_batch_input.jsonl "deepseek-ai/DeepSeek-V3"
```

## Customization

### Change the model

Edit `prepare_together_batch.py` and modify the `model` variable, or pass it as a command-line argument.

### Add a system prompt

Modify `prepare_together_batch.py` to include a system prompt:

```python
system_prompt = "You are analyzing podcast transcripts. Extract key insights..."
prepare_batch_file(input_file, output_file, model, max_tokens, system_prompt)
```

### Adjust max_tokens

Change the `max_tokens` parameter in the script (default: 4000).

## Processing Time

- Most batch jobs complete within 24 hours
- Complex/popular models may take up to 72 hours
- Check status every 30-60 seconds

## Error Handling

Failed requests will be in a separate error file accessible via `error_file_id` from the batch object. Always check this file for partial failures.

## References

- [Together.ai Batch API Documentation](https://docs.together.ai/docs/batch-inference)
- [Together.ai Python SDK](https://github.com/togethercomputer/together-python)

