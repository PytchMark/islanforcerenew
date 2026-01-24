# Island Force Renewables — Solar Power Movement Funnel

Premium, single-page funnel for Island Force Renewables (Jamaica solar). Built with static HTML/CSS/JS for GitHub Pages.

## Project Structure
```
.
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── assets/
    └── README.md
```

## Replace Assets
**Hero video + poster**
1. Open `index.html`.
2. Replace the placeholders:
   - `HERO_VIDEO_URL` → your hosted MP4 URL (or `assets/hero-video.mp4`).
   - `HERO_POSTER_URL` → your image URL (or `assets/hero-poster.jpg`).

## WhatsApp Configuration
Open `js/app.js` and update:
```js
const WHATSAPP_NUMBER = "1876XXXXXXX";
```
Use E.164 without the `+` (e.g., `18765551234`). All CTA buttons use `data-wa` keys that map to messages in `waMessages`.

## CTA Map (data-wa → message)
| Key | Message |
| --- | --- |
| `hero_primary` | Hi Island Force Renewables — I’m ready to take control of my power. Can we talk about going solar? |
| `hero_secondary` | Hi — I want to join the solar movement. What’s the best first step? |
| `mobile_chat` | Hi — I’d like to chat on WhatsApp about solar for my home. |
| `mobile_recommendation` | Hi — I’m ready for a recommendation. What should I share to get started? |
| `see_difference` | Hi — I clicked ‘See the Difference’. Can you explain the monthly payment comparison for my home? |
| `modal_complete` | Hi — I reviewed the utility vs solar breakdown. Okay, show me what’s possible for my home. |
| `savings` | Hi — I want to see my potential savings. My estimated monthly light bill is: ____ and I’m located in ____. |
| `financing_qualify` | Hi — I’d like to check financing options I may qualify for. I prefer: (lower monthly payment / deposit / both). |
| `cash_saving` | Hi — I’m planning my solar project. I’m currently saving up and want guidance on timing. |
| `cash_partial` | Hi — I have part of my solar budget ready and want guidance on the next steps. |
| `cash_timing` | Hi — I want guidance on the right timing for my solar project. |
| `final_reco` | Hi — I’d like a solar recommendation. Parish: ____. Residential/Commercial: ____. Monthly bill range: ____. Financing interest: ____. |

## GitHub Pages Deployment
1. Commit and push the repository to GitHub.
2. In the repo settings, go to **Pages**.
3. Set **Source** to `Deploy from a branch`.
4. Choose `main` branch and `/ (root)` folder.
5. Save. Your site will publish in a few minutes.

## Local Preview
Open `index.html` directly in a browser, or run a simple server:
```bash
python -m http.server 8080
```
Then visit `http://localhost:8080`.
