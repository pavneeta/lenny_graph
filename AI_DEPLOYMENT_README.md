# Deploying with AI Coding Tools (Windsurf, Bolt, Cursor, etc.)

This guide is specifically for using AI-powered coding assistants like Windsurf, Bolt, Cursor, or similar tools to deploy this visualization as a website.

## Quick Start for AI Assistants

### Prompt Template for Your AI Assistant

Copy and paste this into your AI coding tool:

```
I have a static website project that needs to be deployed. The main file is 
graph_visualization_v2.html which is an interactive 3D visualization using Three.js.

The project structure:
- graph_visualization_v2.html (main visualization file)
- Final_lenny_extracted_cleaned.jsonl (data file loaded via fetch)
- 298 .txt transcript files (linked from the visualization)
- index.html (landing page)

Requirements:
1. Deploy to [Netlify/Vercel/GitHub Pages] - choose the easiest option
2. Ensure all files are accessible (JSONL and TXT files need to be served)
3. Set up index.html as the default page
4. Configure CORS if needed for JSONL file loading
5. Provide me with the deployment URL

The visualization loads data via fetch('Final_lenny_extracted_cleaned.jsonl') 
and links to transcript files like "Melissa Perri + Denise Tilles.txt"
```

## Step-by-Step Instructions

### For Windsurf/Bolt/Cursor:

1. **Open the project folder** in your AI coding tool

2. **Ask the AI to deploy**:
   ```
   Help me deploy this static website. The main file is graph_visualization_v2.html.
   It needs to serve JSONL and TXT files. Deploy to the easiest free platform.
   ```

3. **The AI will**:
   - Check existing config files (netlify.toml, vercel.json)
   - Set up deployment configuration
   - Guide you through the deployment process
   - Provide the live URL

### Platform-Specific Instructions

#### Netlify Deployment (Recommended)

**Ask your AI:**
```
Deploy this to Netlify. Use the netlify.toml config file. 
Set up continuous deployment from this repository.
```

**What the AI should do:**
1. Verify `netlify.toml` exists
2. Guide you to connect GitHub repo to Netlify
3. Configure build settings (no build needed for static site)
4. Deploy and provide URL

#### Vercel Deployment

**Ask your AI:**
```
Deploy this to Vercel using the vercel.json configuration.
```

**What the AI should do:**
1. Check `vercel.json` exists
2. Run `vercel` command or guide you through dashboard
3. Configure project settings
4. Deploy and provide URL

#### GitHub Pages

**Ask your AI:**
```
Set up GitHub Pages for this repository. The main file is 
graph_visualization_v2.html and index.html should redirect to it.
```

**What the AI should do:**
1. Verify repository is on GitHub
2. Guide you to enable GitHub Pages in settings
3. Configure branch and folder
4. Provide the GitHub Pages URL

## Configuration Files Already Included

This repository includes:

- ✅ `netlify.toml` - Netlify configuration
- ✅ `vercel.json` - Vercel configuration  
- ✅ `index.html` - Landing page that redirects to v2
- ✅ `.gitignore` - Excludes unnecessary files

## What Your AI Should Verify

Before deploying, the AI should check:

1. **All required files are present**:
   - [ ] `graph_visualization_v2.html`
   - [ ] `Final_lenny_extracted_cleaned.jsonl`
   - [ ] `index.html`
   - [ ] At least some `.txt` transcript files

2. **File paths are correct**:
   - [ ] HTML file uses relative paths (not absolute)
   - [ ] JSONL file path matches actual filename
   - [ ] Transcript links use correct filenames

3. **CORS is configured** (if needed):
   - [ ] Static hosting platforms handle this automatically
   - [ ] No additional CORS setup needed for Netlify/Vercel/GitHub Pages

## Testing After Deployment

**Ask your AI to help test:**
```
After deployment, help me verify:
1. The visualization loads correctly
2. The data file (JSONL) loads without CORS errors
3. Clicking nodes shows details
4. Transcript links work
5. Filtering works
```

## Troubleshooting with AI

If something doesn't work, ask your AI:

```
The visualization isn't loading on [platform]. Help me debug:
1. Check browser console errors
2. Verify file paths are correct
3. Check if JSONL file is accessible
4. Verify CORS headers if needed
```

## Common Issues and AI Prompts

### Issue: "Failed to load JSONL file"

**Ask AI:**
```
The fetch('Final_lenny_extracted_cleaned.jsonl') is failing. 
Help me debug the file path and CORS configuration.
```

### Issue: "Transcript links return 404"

**Ask AI:**
```
The transcript file links aren't working. The files are named like 
"Melissa Perri + Denise Tilles.txt". Help me fix the URL encoding 
in the link generation.
```

### Issue: "Graph doesn't render"

**Ask AI:**
```
The Three.js graph isn't rendering. Check:
1. Three.js CDN is loading
2. OrbitControls is loading
3. Scene initialization is correct
4. Browser console for errors
```

## Deployment Checklist for AI

When deploying, your AI should ensure:

- [ ] All files are committed to git
- [ ] Repository is pushed to GitHub (for GitHub Pages/Netlify)
- [ ] Configuration files are correct
- [ ] No build process needed (static site)
- [ ] All assets are in the root directory
- [ ] CORS is handled (automatic on most platforms)
- [ ] HTTPS is enabled (automatic on most platforms)

## Post-Deployment

**Ask your AI:**
```
The site is deployed at [URL]. Help me:
1. Test all functionality
2. Set up a custom domain (optional)
3. Configure automatic deployments from git
4. Add analytics (optional)
```

## Quick Deploy Commands

If your AI tool has terminal access, it can run:

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Vercel:**
```bash
npm install -g vercel
vercel
```

**GitHub Pages:**
```bash
# Already configured via GitHub UI
# Just push to main branch
git push origin main
```

## Need Help?

Ask your AI coding assistant:
- "Help me deploy this static website"
- "Set up continuous deployment for this project"
- "Debug why the visualization isn't loading after deployment"
- "Configure a custom domain for this site"

The AI should be able to guide you through the entire deployment process!

