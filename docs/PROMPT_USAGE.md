# How to Add Prompts to Batch Inference

There are two ways to add prompts to your batch inference:

## Method 1: System Prompt (Recommended)

A system prompt sets the context and behavior for the model. It's added as a separate message with `role: "system"`.

### Create a system prompt file

Create a text file (e.g., `system_prompt.txt`) with your instructions:

```
You are an expert at analyzing podcast transcripts. Your task is to extract key insights, themes, and actionable advice from product management and technology podcast conversations. Focus on identifying the most valuable takeaways that would be useful for product managers, founders, and tech leaders.
```

### Use it when generating the batch file

```bash
python3 prepare_together_batch.py transcripts_batch.jsonl together_batch_input.jsonl "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo" 4000 system_prompt.txt
```

The script will automatically load the prompt file and add it as a system message.

## Method 2: User Prompt Template

A user prompt template wraps the transcript with instructions. Use `{transcript}` as a placeholder for where the transcript should be inserted.

### Create a user prompt template file

Create a text file (e.g., `user_prompt_template.txt`):

```
Please analyze the following podcast transcript and extract:

1. 3-5 key takeaways (the most important insights or lessons)
2. Main themes and topics discussed
3. Actionable advice for product managers and founders

Transcript:
{transcript}

Provide your analysis in a structured format.
```

### Modify the script to use it

You'll need to modify `prepare_together_batch.py` to load and use the user prompt template, or add it as a 6th argument.

## Method 3: Direct Python Usage

You can also call the function directly in Python:

```python
from prepare_together_batch import prepare_batch_file

# With system prompt
system_prompt = "You are an expert at analyzing podcast transcripts..."
prepare_batch_file(
    "transcripts_batch.jsonl",
    "together_batch_input.jsonl",
    model="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    max_tokens=4000,
    system_prompt=system_prompt
)

# With user prompt template
user_template = "Analyze this transcript:\n\n{transcript}\n\nExtract key insights."
prepare_batch_file(
    "transcripts_batch.jsonl",
    "together_batch_input.jsonl",
    model="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    max_tokens=4000,
    user_prompt_template=user_template
)
```

## Example Prompt Files

- `example_system_prompt.txt` - Example system prompt
- `example_user_prompt_template.txt` - Example user prompt template

## Current Batch File

The current `together_batch_input.jsonl` was created **without** a prompt. To regenerate it with a prompt:

```bash
# With system prompt
python3 prepare_together_batch.py transcripts_batch.jsonl together_batch_input.jsonl "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo" 4000 example_system_prompt.txt

# Without prompt (current version)
python3 prepare_together_batch.py transcripts_batch.jsonl together_batch_input.jsonl
```

## Tips

1. **System prompts** are better for setting overall behavior and context
2. **User prompt templates** are better when you need to format the input in a specific way
3. You can use both together - system prompt for context, user template for formatting
4. Keep prompts concise but clear - longer prompts use more tokens
5. Test your prompt with a single transcript first before running the full batch

