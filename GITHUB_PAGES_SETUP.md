# GitHub Pages Setup Guide

Your website has been pushed to GitHub and is ready to be deployed!

## 🚀 Quick Setup (5 minutes)

### Step 1: Enable GitHub Pages
1. Go to your repository: https://github.com/Yegmina/StudyShortsWebSite
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - **Branch**: `main`
   - **Folder**: `/website`
5. Click **Save**

### Step 2: Wait for Deployment
- GitHub will build and deploy your site (takes 1-2 minutes)
- You'll see a green checkmark when it's ready
- Your site will be live at: `https://yegmina.github.io/StudyShortsWebSite/`

### Step 3: Custom Domain (Optional)
If you have a custom domain:
1. In Pages settings, add your domain
2. Update DNS records as instructed
3. Wait for DNS propagation

## ✅ What's Included

- ✅ Complete website with all features
- ✅ Waitlist form (Formspree integration)
- ✅ Contact form (Formspree integration)
- ✅ Social media links
- ✅ Responsive design
- ✅ `.nojekyll` file (ensures static files work correctly)
- ✅ README documentation

## 📝 Files Structure

```
StudyShortsWebSite/
├── website/              ← GitHub Pages source folder
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── images/
│   └── .nojekyll
├── .gitignore
└── README.md
```

## 🔄 Updating Your Website

To update your website:
1. Make changes to files in the `website/` folder
2. Commit and push:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. GitHub Pages will automatically rebuild (takes 1-2 minutes)

## 🐛 Troubleshooting

### Site not loading?
- Check GitHub Pages settings (Source should be `/website`)
- Wait a few minutes for initial deployment
- Check Actions tab for build errors

### Forms not working?
- Verify Formspree endpoint is correct in `website/js/waitlist.js` and `website/js/main.js`
- Check browser console for errors (F12)

### Images not showing?
- Make sure image paths are relative (e.g., `images/logo.png`)
- Check that all images are in the `website/images/` folder

## 📧 Form Configuration

Both forms use Formspree:
- **Waitlist**: `https://formspree.io/f/xzznwjvg`
- **Contact**: Same endpoint, different subject

To change endpoints, edit:
- `website/js/waitlist.js` (line 3)
- `website/js/main.js` (line 115)

## 🎉 You're All Set!

Your website is now live on GitHub Pages. Share the link and start collecting waitlist signups!

**Live URL**: https://yegmina.github.io/StudyShortsWebSite/

