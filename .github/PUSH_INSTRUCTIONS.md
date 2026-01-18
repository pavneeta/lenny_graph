# Push to GitHub Instructions

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right, then "New repository"
3. Name it (e.g., `lennys-podcast-graph` or `lenny-podcast-visualization`)
4. **Do NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 2: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote (replace YOUR_USERNAME and REPO_NAME with your actual values)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

## Alternative: Using SSH

If you prefer SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## What's Included

The repository includes:
- ✅ All 298 transcript files (.txt)
- ✅ Main visualization files (graph_visualization.html, graph_visualization_v2.html)
- ✅ Data files (Final_lenny_extracted_cleaned.jsonl, episodes_metadata.json)
- ✅ Extraction scripts (extract_metadata.py, extract_metadata_ai.py)
- ✅ Documentation (README.md, EXTRACTION_INSTRUCTIONS.md)
- ✅ Requirements (requirements.txt)
- ✅ .gitignore (excludes temporary files)

## Excluded Files

The following are excluded via .gitignore:
- Python cache files
- Temporary/intermediate JSONL files
- Large training data files
- IDE files

## GitHub Pages (Optional)

To host the visualization on GitHub Pages:

1. Go to repository Settings → Pages
2. Select source branch: `main`
3. Select folder: `/ (root)`
4. Save
5. Access at: `https://YOUR_USERNAME.github.io/REPO_NAME/graph_visualization_v2.html`

