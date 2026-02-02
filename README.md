# Island Force Renewables Funnel V2

Premium, conversion-focused “Solar Power Movement” funnel built as a Cloud Run deployable Node/Express app.

## Local development

```bash
npm install
npm run dev
```

The app serves the funnel from `public/` and exposes API routes from `server.js`.

## Asset constants

Asset URLs are centralized in `public/js/app.js` within the `ASSETS` object. Update the URLs there to swap imagery or video without touching the HTML.

| ASSETS constant | Controls | Recommended local filename |
| --- | --- | --- |
| `logoUrl` | Navigation logo image | `public/assets/img/logo.png` |
| `heroBgVideoUrl` | Hero background video | `public/assets/video/hero.mp4` |
| `heroPosterUrl` | Hero video poster image | `public/assets/img/hero-poster.jpg` |
| `financingImageUrl` | Financing image panel | `public/assets/img/financing.jpg` |
| `solarExplainerVideoUrl` | Solar explainer inline video | `public/assets/video/solar-explainer.mp4` |
| `solarExplainerPosterUrl` | Solar explainer poster image | `public/assets/img/solar-explainer.jpg` |
| `whyGoSolarImageUrl` | Comparison image panel | `public/assets/img/why-go-solar.jpg` |
| `savingsSideImageUrl` | Savings image panel | `public/assets/img/savings-side.jpg` |
| `processImageUrl` | Process image panel | `public/assets/img/process.jpg` |
| `projectsStripVideoUrl` | Projects header strip video | `public/assets/video/projects.mp4` |
| `projectsStripPosterUrl` | Projects header strip poster image | `public/assets/img/projects-poster.jpg` |

## Environment variables

Create a `.env` file locally (see `.env.example`) and configure:

- `PORT` (Cloud Run provides this; default `8080`)
- `WHATSAPP_NUMBER` (e.g. `1876XXXXXXX`)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER` (e.g. `islandforce/projects`)
- `GALLERY_CACHE_TTL_SECONDS` (default `300`)
- `HERO_VIDEO_URL`
- `HERO_POSTER_URL`
- `FINANCING_VIDEO_URL`
- `FINANCING_POSTER_URL`
- `PROJECTS_VIDEO_URL`
- `PROJECTS_POSTER_URL`

### Video backgrounds

If any of the `*_VIDEO_URL` values are unset, the frontend falls back to `/public/assets/video/*.mp4`. Replace these placeholder files with your preferred videos.

## Gallery behavior

The `/api/gallery` endpoint pulls both images and videos from the Cloudinary folder specified by `CLOUDINARY_FOLDER`. When new media is uploaded to that folder it automatically appears in the Projects section without code changes.

## Cloud Run deployment

```bash
# Build and push
export PROJECT_ID=your-project
export REGION=us-central1
export SERVICE_NAME=island-force-renewables

gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy

gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars PORT=8080,WHATSAPP_NUMBER=1876XXXXXXX,CLOUDINARY_CLOUD_NAME=your_cloud,CLOUDINARY_API_KEY=key,CLOUDINARY_API_SECRET=secret,CLOUDINARY_FOLDER=islandforce/projects
```

For video backgrounds, pass the optional `*_VIDEO_URL` and `*_POSTER_URL` values via `--set-env-vars` as well.
