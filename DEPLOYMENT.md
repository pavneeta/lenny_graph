# Deployment Guide - Lenny's Podcast Graph

This guide explains how to deploy the 3D relational graph visualization as a live website.

## Quick Deploy Options

### Option 1: GitHub Pages (Free, Easiest)

1. **Push to GitHub** (if not already done):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select:
     - Branch: `main`
     - Folder: `/ (root)`
   - Click **Save**

3. **Access your site**:
   - Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/graph_visualization_v2.html`
   - Main page: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

4. **Optional: Set default page**:
   Create an `index.html` that redirects to the visualization:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <meta http-equiv="refresh" content="0; url=graph_visualization_v2.html">
   </head>
   <body>
       <p>Redirecting to <a href="graph_visualization_v2.html">graph visualization</a>...</p>
   </body>
   </html>
   ```

### Option 2: Netlify (Free, Recommended)

1. **Install Netlify CLI** (optional):
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy via Netlify Dashboard**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: `/` (root)
   - Click "Deploy site"

3. **Deploy via CLI**:
   ```bash
   cd "/Users/pavneetahluwalia/Downloads/Lenny's Podcast Transcripts Archive [public]"
   netlify deploy --prod
   ```

4. **Your site will be live** at a Netlify URL (e.g., `https://your-site.netlify.app`)

### Option 3: Vercel (Free)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd "/Users/pavneetahluwalia/Downloads/Lenny's Podcast Transcripts Archive [public]"
   vercel
   ```

3. **Follow the prompts** and your site will be deployed

### Option 4: Cloudflare Pages (Free)

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect your GitHub repository
3. Build settings:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: `/`
4. Deploy

### Option 5: Surge.sh (Free)

1. **Install Surge**:
   ```bash
   npm install -g surge
   ```

2. **Deploy**:
   ```bash
   cd "/Users/pavneetahluwalia/Downloads/Lenny's Podcast Transcripts Archive [public]"
   surge
   ```

3. **Follow prompts** to set your domain

## Using AI Coding Tools (Windsurf, Bolt, etc.)

If you're using an AI coding assistant like Windsurf or Bolt to deploy:

### For Windsurf/Bolt:

1. **Open the project** in your AI coding tool
2. **Ask the AI**:
   ```
   Help me deploy this static website to [Netlify/Vercel/GitHub Pages].
   The main file is graph_visualization_v2.html and it needs to load 
   Final_lenny_extracted_cleaned.jsonl from the same directory.
   ```

3. **The AI will help you**:
   - Set up the deployment configuration
   - Create necessary config files
   - Deploy the site

### Configuration Files Needed

#### For Netlify (`netlify.toml`):
```toml
[build]
  publish = "."
  
[[redirects]]
  from = "/*"
  to = "/graph_visualization_v2.html"
  status = 200
```

#### For Vercel (`vercel.json`):
```json
{
  "rewrites": [
    {
      "source": "/",
      "destination": "/graph_visualization_v2.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

## Important Notes for Deployment

### File Requirements

Ensure these files are in the root directory:
- ✅ `graph_visualization_v2.html` (main visualization)
- ✅ `Final_lenny_extracted_cleaned.jsonl` (data file)
- ✅ All `.txt` transcript files (for transcript links to work)
- ✅ `episodes_metadata.json` (if using v1)

### CORS Considerations

The visualization loads JSON/JSONL files via `fetch()`. Most static hosting platforms handle this automatically, but if you encounter CORS errors:

1. **GitHub Pages**: Works automatically
2. **Netlify/Vercel**: Works automatically
3. **Custom server**: Add CORS headers:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET
   ```

### Testing Locally Before Deploy

Always test locally first:

```bash
# Start local server
python3 -m http.server 8000

# Test both versions
# V2: http://localhost:8000/graph_visualization_v2.html
# V1: http://localhost:8000/graph_visualization.html
```

## Custom Domain (Optional)

### GitHub Pages:
1. Add a `CNAME` file with your domain name
2. Configure DNS records as GitHub instructs

### Netlify:
1. Go to Site settings → Domain management
2. Add your custom domain
3. Follow DNS configuration instructions

### Vercel:
1. Go to Project settings → Domains
2. Add your domain
3. Configure DNS

## Troubleshooting

### Issue: Graph doesn't load
- **Check browser console** for errors
- **Verify data file** is accessible (try opening the JSONL file directly)
- **Check file paths** are correct (relative paths should work)

### Issue: Transcript links don't work
- **Verify transcript files** are in the same directory
- **Check file names** match exactly (including special characters)
- **Ensure files are committed** to the repository

### Issue: CORS errors
- **Use a proper hosting service** (GitHub Pages, Netlify, Vercel)
- **Don't use `file://` protocol** - always use `http://` or `https://`

## Recommended Setup

**Best for beginners**: GitHub Pages
- Free
- Easy setup
- Automatic HTTPS
- Works with your existing GitHub repo

**Best for performance**: Netlify or Vercel
- Free tier available
- Fast CDN
- Easy custom domains
- Automatic deployments from Git

## Post-Deployment Checklist

- [ ] Test the visualization loads correctly
- [ ] Test filtering works
- [ ] Test clicking nodes shows details
- [ ] Test transcript links work
- [ ] Test on mobile device
- [ ] Share the URL with others to test

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all files are uploaded
3. Test locally first
4. Check hosting platform logs

