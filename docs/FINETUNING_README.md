# Fine-tuning Data for Lenny's Podcast Product LLM

This directory contains training and validation data prepared from Lenny's Podcast transcripts for fine-tuning a Qwen 3-0.6B model (or any compatible model) on Together.ai.

## Files

- `train_data.jsonl` - Training dataset (12,893 examples, ~22.5 MB)
- `val_data.jsonl` - Validation dataset (1,433 examples, ~2.4 MB)
- `prepare_finetuning_data.py` - Script used to generate the datasets

## Data Format

The data is in JSONL format with instruction-completion pairs, following Together.ai's instruction fine-tuning format:

```json
{
  "prompt": "Based on insights from Lenny's Podcast episode with [Guest Name], share key product management advice and frameworks discussed.",
  "completion": "[Cleaned transcript content from the episode]"
}
```

Each line in the JSONL file is a separate training example.

## Data Statistics

- **Total Episodes Processed**: 294
- **Total Examples**: 14,326
- **Training Examples**: 12,893 (90%)
- **Validation Examples**: 1,433 (10%)

## Using with Together.ai

### 1. Verify Data Format

Before uploading, verify your data format:

```bash
together files check train_data.jsonl
together files check val_data.jsonl
```

### 2. Upload Files

Upload the training and validation files to Together.ai:

```bash
together files upload train_data.jsonl
together files upload val_data.jsonl
```

This will return file IDs that you'll use in the fine-tuning job.

### 3. Start Fine-tuning Job

Use the Together.ai API or CLI to start a fine-tuning job:

```bash
together fine-tune create \
  --training-file <training_file_id> \
  --validation-file <validation_file_id> \
  --model Qwen/Qwen3-0.6B \
  --n-epochs 3 \
  --learning-rate 2e-5 \
  --batch-size 4
```

Or using Python SDK:

```python
import together

# Initialize client
together.api_key = "your-api-key"

# Create fine-tuning job
response = together.FineTune.create(
    training_file="<training_file_id>",
    validation_file="<validation_file_id>",
    model="Qwen/Qwen3-0.6B",
    n_epochs=3,
    learning_rate=2e-5,
    batch_size=4,
    suffix="lenny-podcast-product-llm"
)
```

### 4. Monitor Training

Check the status of your fine-tuning job:

```bash
together fine-tune get <job_id>
```

### 5. Deploy Fine-tuned Model

Once training completes, deploy your fine-tuned model:

```bash
together models.deploy.create(
    fine_tune_id="<fine_tune_id>"
)
```

## Regenerating Data

If you need to regenerate the training/validation data:

```bash
python3 prepare_finetuning_data.py
```

Options:
- `transcript_dir` - Directory containing transcript files (default: current directory)
- `train_output` - Output file for training data (default: `train_data.jsonl`)
- `val_output` - Output file for validation data (default: `val_data.jsonl`)
- `val_split` - Validation split ratio (default: 0.1)

Example:
```bash
python3 prepare_finetuning_data.py . train_data.jsonl val_data.jsonl 0.15
```

## Data Processing Details

The script:
1. Reads all `.txt` transcript files from the directory
2. Cleans transcripts by removing timestamps and speaker labels
3. Splits transcripts into meaningful chunks (200-2000 characters)
4. Creates instruction-completion pairs with product management-focused prompts
5. Randomly splits data into training (90%) and validation (10%) sets
6. Saves as JSONL files in Together.ai format

## Notes

- The data uses instruction format (`prompt`/`completion`) as specified in [Together.ai's documentation](https://docs.together.ai/docs/fine-tuning-data-preparation)
- By default, models will not be trained to predict the text from the prompt (only completions)
- To include prompts in training, use `--train-on-inputs true` flag
- File size must be under 25GB (current files are well under this limit)

## References

- [Together.ai Fine-tuning Documentation](https://docs.together.ai/docs/fine-tuning-data-preparation)
- [Together.ai Fine-tuning Guide](https://docs.together.ai/docs/fine-tuning)
- [Qwen Models](https://huggingface.co/Qwen)

