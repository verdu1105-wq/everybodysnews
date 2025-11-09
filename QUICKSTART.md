# Quick Start Guide - Everybody's News Updates

## 🎯 What Changed?

### 1. Feed Updates
- **Removed**: NY Times U.S. News feed
- **Added**: ABC News Top Stories (http://feeds.abcnews.com/abcnews/topstories)
- **Added**: MediaStack API for breaking news

### 2. Rex Carousel (Second Carousel)
- **Height**: Adjusted to 500px (was 600px)
- **Padding**: Adjusted to 1.5rem (was 2rem)
- Better mobile responsiveness

### 3. New Features
- Breaking news from CNN/BBC via MediaStack API
- Auto-refresh every 5 minutes
- Better error handling
- Improved mobile experience

## 🏃‍♂️ Quick Testing (Local)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

### Step 3: Open Browser
Navigate to: http://localhost:8080

### Step 4: Test Each Carousel
1. **Breaking News** (First carousel) - Should show CNN/BBC news
2. **ABC News** (Second carousel - Rex) - Should show ABC top stories
3. **Sports** (Third carousel) - Should show ESPN sports news
4. **World News** (Fourth carousel) - Should show world news
5. **Tech News** (Fifth carousel) - Should show technology news

## 🔍 API Testing

### Test MediaStack API
```bash
# Test breaking news endpoint
curl http://localhost:8080/api/breaking-news

# Test live news with parameters
curl "http://localhost:8080/api/live-news?sources=cnn,bbc&limit=5"

# Test business news
curl http://localhost:8080/api/business-news
```

### Test RSS Feeds
```bash
# Test all feeds
curl http://localhost:8080/api/feeds/all

# Test ABC News feed (NEW)
curl http://localhost:8080/api/feeds/abc

# Test sports feed
curl http://localhost:8080/api/feeds/sports
```

## 🚀 Deploy to Google Cloud Run

### Option 1: Use Deploy Script (Easiest)
**Windows:**
```cmd
deploy.bat
```

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment
```bash
# Build image
gcloud builds submit --tag gcr.io/cybergrid/everybodysnews

# Deploy
gcloud run deploy everybodys-news-app \
  --image gcr.io/cybergrid/everybodysnews \
  --platform managed \
  --region us-east1 \
  --allow-unauthenticated
```

## 📝 Commit to GitHub

### Step 1: Add Files
```bash
git add .
```

### Step 2: Commit Changes
```bash
git commit -m "Update: Added ABC News, MediaStack API, adjusted Rex carousel"
```

### Step 3: Push to Main Branch
```bash
git push origin main
```

## ✅ Verification Checklist

After deployment, verify:
- [ ] Breaking news carousel loads (MediaStack API)
- [ ] ABC News carousel loads (second carousel)
- [ ] Rex carousel has correct height (500px)
- [ ] All carousels auto-rotate
- [ ] Navigation arrows work
- [ ] Mobile responsive design works
- [ ] Touch/swipe works on mobile
- [ ] No console errors in browser

## 🐛 Common Issues

### Issue: "Cannot find module 'express'"
**Solution**: Run `npm install`

### Issue: "Port 8080 already in use"
**Solution**: 
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8080 | xargs kill -9
```

### Issue: MediaStack API not working
**Check**:
1. API key is correct: `96759e8f7a664ec0ee650f1fa7043992`
2. Internet connection is active
3. Check server logs for errors

### Issue: ABC News feed not loading
**Check**:
1. URL is correct: `http://feeds.abcnews.com/abcnews/topstories`
2. CORS is enabled in server
3. Check browser console for errors

## 📊 Rex Carousel Specifications

### Desktop (≥1200px)
- Height: 500px
- Padding: 1.5rem
- Content padding: 1.5rem

### Tablet (768px - 991px)
- Height: 450px
- Padding: 1rem
- Content padding: 1rem

### Mobile (<768px)
- Height: 400px
- Padding: 0.5rem
- Content padding: 1rem

### Extra Small (<480px)
- Height: 350px
- Navigation arrows hidden
- Swipe gestures only

## 🔄 Auto-Update Features

1. **Carousel Rotation**: Every 5 seconds
2. **News Refresh**: Every 5 minutes
3. **Pause on Hover**: Carousels pause when mouse hovers
4. **Visibility API**: Pauses when tab is hidden

## 📱 Mobile Features

- Touch/swipe navigation
- Responsive images
- Optimized loading
- Adjusted carousel heights
- Hidden navigation arrows on small screens

## 🎨 Customization

### Change Rex Carousel Height
Edit `style.css`:
```css
.carousel-section.rex-carousel .carousel-wrapper {
  height: 500px; /* Change this value */
}
```

### Change Auto-rotation Speed
Edit `carousel.js`:
```javascript
carousel.autoplayInterval = setInterval(() => {
  nextSlide(carouselId);
}, 5000); // Change 5000 to desired milliseconds
```

### Add More News Sources
Edit `server.js`:
```javascript
const RSS_FEEDS = {
  // Add new feed here
  newSource: 'https://example.com/rss',
  // ...existing feeds
};
```

## 📞 Need Help?

1. Check server logs: Look at terminal output
2. Check browser console: Press F12 in browser
3. Check Cloud Run logs:
   ```bash
   gcloud run logs read everybodys-news-app --limit 50
   ```

## 🎉 You're Ready!

Your news site now features:
✅ ABC News top stories
✅ MediaStack breaking news
✅ Optimized Rex carousel
✅ Better mobile experience
✅ Auto-refresh capabilities

Happy news browsing! 📰
