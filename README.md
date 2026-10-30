# cedb user objective images

Paste a cedb.me user page link (e.g. `https://cedb.me/user/<id>`) and download that user's
completed objective images, one zip per objective type:

| Zip | cedb `objective.type` |
|---|---|
| `<DisplayName>_POs.zip` | `primary` |
| `<DisplayName>_SOs.zip` | `secondary` |
| `<DisplayName>_COs.zip` | `community` |
| `<DisplayName>_SiteAchs.zip` | `site-achievement` |

`<DisplayName>` is the user's display name with everything except letters and numbers removed.
Images inside each zip are named `Game - Objective name.<ext>`. Any image that cannot be
downloaded is listed in `_missing_images.txt` inside that zip.

## How it works

- `index.html`: the page. Looks up the user, groups `userObjectives` by `objective.type`,
  downloads each `objective.icon`, and builds the zip in the browser (no libraries).
- `api/user.js`: Vercel function that relays `https://cedb.me/api/user/<id>`.
- `api/image.js`: Vercel function that relays an image (https only, images only, 10 MB max).

The relays exist because cedb.me and the image hosts do not send CORS headers, so a
browser page on another domain cannot read them directly.

## Deploying on Vercel

1. Sign in at https://vercel.com with your GitHub account.
2. **Add New… > Project**, then **Import** this repository.
3. Leave Framework Preset as **Other** and all build settings blank. Click **Deploy**.
4. The site is live at `https://<project-name>.vercel.app`. Every push to `main` redeploys.

## Running locally

`npx vercel dev` (needs the Vercel CLI and a Vercel login).
