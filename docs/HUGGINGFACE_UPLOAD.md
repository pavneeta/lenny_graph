# Uploading Fine-tuned Model to Hugging Face Hub

This guide explains how to upload your fine-tuned model checkpoint (from Together.ai or other sources) to Hugging Face Hub.

## Prerequisites

1. **Hugging Face Account**: Create an account at [huggingface.co](https://huggingface.co/join)
2. **Hugging Face Token**: Get your API token from [Settings > Access Tokens](https://huggingface.co/settings/tokens)
   - Create a token with "Write" permissions
3. **Model Checkpoint**: Your downloaded checkpoint directory should contain:
   - `config.json` (required)
   - Model weights (one of: `model.safetensors`, `pytorch_model.bin`, `model.bin`)
   - Tokenizer files (optional but recommended: `tokenizer.json`, `tokenizer_config.json`, etc.)

## Installation

Install required dependencies:

```bash
pip install huggingface_hub>=0.20.0
```

Or install from the requirements file:

```bash
pip install -r scripts/requirements.txt
```

## Authentication

### Option 1: Login via CLI (Recommended)

```bash
huggingface-cli login
```

Enter your Hugging Face token when prompted.

### Option 2: Use Token in Script

You can pass the token directly to the upload script using the `--token` flag.

## Uploading Your Model

### Basic Usage

```bash
python scripts/upload_to_huggingface.py <checkpoint_dir> <repo_name>
```

**Example:**
```bash
python scripts/upload_to_huggingface.py ./checkpoint my-username/lenny-podcast-product-llm
```

### Options

- `checkpoint_dir`: Path to your checkpoint directory
- `repo_name`: Hugging Face repository name in format `username/model-name`
- `--private`: Create a private repository (default: public)
- `--token`: Hugging Face API token (optional if already logged in)
- `--commit-message`: Custom commit message

### Examples

**Public Repository:**
```bash
python scripts/upload_to_huggingface.py ./checkpoint my-username/lenny-podcast-product-llm
```

**Private Repository:**
```bash
python scripts/upload_to_huggingface.py ./checkpoint my-username/lenny-podcast-product-llm --private
```

**With Explicit Token:**
```bash
python scripts/upload_to_huggingface.py ./checkpoint my-username/lenny-podcast-product-llm --token hf_xxxxxxxxxxxxx
```

**Custom Commit Message:**
```bash
python scripts/upload_to_huggingface.py ./checkpoint my-username/lenny-podcast-product-llm --commit-message "Fine-tuned on Lenny's Podcast transcripts"
```

## Checkpoint Directory Structure

Your checkpoint directory should look something like this:

```
checkpoint/
├── config.json              # Model configuration (required)
├── model.safetensors        # Model weights (or pytorch_model.bin)
├── tokenizer.json           # Tokenizer (optional)
├── tokenizer_config.json    # Tokenizer config (optional)
├── vocab.json               # Vocabulary (optional)
└── special_tokens_map.json  # Special tokens (optional)
```

## What the Script Does

1. **Validates** the checkpoint directory and checks for required files
2. **Lists** all files that will be uploaded
3. **Creates** the Hugging Face repository (if it doesn't exist)
4. **Uploads** all files from the checkpoint directory
5. **Provides** a link to your uploaded model

## After Upload

Once uploaded, your model will be available at:
```
https://huggingface.co/<username>/<model-name>
```

### Using Your Model

You can now use your model with the Hugging Face transformers library:

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "your-username/lenny-podcast-product-llm"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)
```

### Adding Model Card

After uploading, you can add a model card (README.md) to provide:
- Model description
- Training details
- Usage examples
- Limitations

Edit the README.md file directly on the Hugging Face website or push it to the repository.

## Troubleshooting

### "No Hugging Face token found"
- Run `huggingface-cli login` or provide `--token` flag
- Make sure your token has "Write" permissions

### "config.json not found"
- Ensure your checkpoint directory contains `config.json`
- This file is required for Hugging Face uploads

### "Repository already exists"
- The script will use the existing repository
- Make sure you have write access to the repository

### Large File Uploads
- Large models may take time to upload
- Ensure stable internet connection
- The script will show progress during upload

## Alternative: Manual Upload via Web UI

You can also upload files manually:

1. Go to [huggingface.co/new](https://huggingface.co/new)
2. Create a new model repository
3. Use the "Files" tab to upload files
4. Drag and drop or use the upload button

## References

- [Hugging Face Hub Documentation](https://huggingface.co/docs/hub/index)
- [Hugging Face Hub Python Library](https://huggingface.co/docs/huggingface_hub/index)
- [Model Cards Guide](https://huggingface.co/docs/hub/model-cards)

