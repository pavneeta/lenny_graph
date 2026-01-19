#!/usr/bin/env python3
"""
Upload a fine-tuned model checkpoint to Hugging Face Hub.

This script uploads a model checkpoint directory (downloaded from Together.ai or elsewhere)
to the Hugging Face Hub.

Usage:
    python upload_to_huggingface.py <checkpoint_dir> <repo_name> [--private] [--token <token>]

Example:
    python upload_to_huggingface.py ./checkpoint my-username/lenny-podcast-product-llm
    python upload_to_huggingface.py ./checkpoint my-username/lenny-podcast-product-llm --private
"""

import os
import sys
import argparse
from pathlib import Path
from huggingface_hub import HfApi, create_repo, upload_folder
from huggingface_hub.utils import HfFolder

def check_required_files(checkpoint_dir: Path) -> bool:
    """Check if required model files exist."""
    required_files = ['config.json']
    optional_files = ['model.safetensors', 'pytorch_model.bin', 'model.bin', 
                     'tokenizer.json', 'tokenizer_config.json', 'vocab.json',
                     'merges.txt', 'special_tokens_map.json']
    
    print(f"Checking checkpoint directory: {checkpoint_dir}")
    
    if not checkpoint_dir.exists():
        print(f"Error: Directory {checkpoint_dir} does not exist")
        return False
    
    # Check for config.json
    config_file = checkpoint_dir / 'config.json'
    if not config_file.exists():
        print(f"Error: config.json not found in {checkpoint_dir}")
        print("This file is required for Hugging Face uploads")
        return False
    
    # Check for at least one model file
    model_files = [
        checkpoint_dir / 'model.safetensors',
        checkpoint_dir / 'pytorch_model.bin',
        checkpoint_dir / 'model.bin',
        checkpoint_dir / 'adapter_model.safetensors',  # For LoRA adapters
    ]
    
    found_model = any(f.exists() for f in model_files)
    if not found_model:
        print("Warning: No model weight files found (model.safetensors, pytorch_model.bin, etc.)")
        print("The upload will continue, but the model may not be usable without weights")
    
    # List all files found
    print("\nFiles found in checkpoint directory:")
    for file in sorted(checkpoint_dir.iterdir()):
        if file.is_file():
            size_mb = file.stat().st_size / (1024 * 1024)
            print(f"  ✓ {file.name} ({size_mb:.2f} MB)")
    
    return True

def upload_model(
    checkpoint_dir: str,
    repo_name: str,
    private: bool = False,
    token: str = None,
    commit_message: str = "Upload fine-tuned model"
):
    """
    Upload model checkpoint to Hugging Face Hub.
    
    Args:
        checkpoint_dir: Path to the checkpoint directory
        repo_name: Hugging Face repository name (e.g., 'username/model-name')
        private: Whether to create a private repository
        token: Hugging Face API token (if not provided, will use saved token)
        commit_message: Commit message for the upload
    """
    checkpoint_path = Path(checkpoint_dir).resolve()
    
    # Validate checkpoint directory
    if not check_required_files(checkpoint_path):
        sys.exit(1)
    
    # Get or set Hugging Face token
    if token:
        HfFolder.save_token(token)
        print(f"\n✓ Using provided Hugging Face token")
    else:
        saved_token = HfFolder.get_token()
        if not saved_token:
            print("\nError: No Hugging Face token found!")
            print("Please provide a token using --token or login with:")
            print("  huggingface-cli login")
            print("\nYou can get a token from: https://huggingface.co/settings/tokens")
            sys.exit(1)
        print(f"\n✓ Using saved Hugging Face token")
    
    # Initialize API
    api = HfApi()
    
    # Create repository if it doesn't exist
    print(f"\nCreating/verifying repository: {repo_name}")
    try:
        create_repo(
            repo_id=repo_name,
            token=token,
            private=private,
            exist_ok=True,
            repo_type="model"
        )
        print(f"✓ Repository ready: https://huggingface.co/{repo_name}")
    except Exception as e:
        print(f"Error creating repository: {e}")
        sys.exit(1)
    
    # Upload files
    print(f"\nUploading files from {checkpoint_path}...")
    print("This may take a while depending on file sizes...\n")
    
    try:
        upload_folder(
            folder_path=str(checkpoint_path),
            repo_id=repo_name,
            token=token,
            commit_message=commit_message,
            ignore_patterns=[".git*", "__pycache__", "*.pyc", ".DS_Store"]
        )
        print(f"\n{'='*60}")
        print("✓ Upload complete!")
        print(f"✓ Model available at: https://huggingface.co/{repo_name}")
        print(f"{'='*60}")
    except Exception as e:
        print(f"\nError uploading files: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="Upload fine-tuned model checkpoint to Hugging Face Hub",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Public repository
  python upload_to_huggingface.py ./checkpoint my-username/lenny-podcast-product-llm
  
  # Private repository
  python upload_to_huggingface.py ./checkpoint my-username/lenny-podcast-product-llm --private
  
  # With explicit token
  python upload_to_huggingface.py ./checkpoint my-username/lenny-podcast-product-llm --token hf_xxxxx
        """
    )
    
    parser.add_argument(
        "checkpoint_dir",
        type=str,
        help="Path to the checkpoint directory containing model files"
    )
    
    parser.add_argument(
        "repo_name",
        type=str,
        help="Hugging Face repository name (format: username/model-name)"
    )
    
    parser.add_argument(
        "--private",
        action="store_true",
        help="Create a private repository (default: public)"
    )
    
    parser.add_argument(
        "--token",
        type=str,
        default=None,
        help="Hugging Face API token (optional if already logged in)"
    )
    
    parser.add_argument(
        "--commit-message",
        type=str,
        default="Upload fine-tuned model from Lenny's Podcast",
        help="Commit message for the upload"
    )
    
    args = parser.parse_args()
    
    upload_model(
        checkpoint_dir=args.checkpoint_dir,
        repo_name=args.repo_name,
        private=args.private,
        token=args.token,
        commit_message=args.commit_message
    )

if __name__ == "__main__":
    main()

