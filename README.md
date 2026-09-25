# Image Vault

An Adobe App Builder app to **upload and download images**. Files are stored in
Adobe I/O Files blob storage under `public/` so each image gets a shareable URL.

## Features
- Upload images (PNG, JPEG, GIF, WebP, SVG · up to 5 MB) with a drag-friendly form + live preview
- Gallery of uploaded images with **Download** links
- Delete images with a confirmation dialog
- ExC Shell SPA built with Adobe React Spectrum

## Structure
```
app.config.yaml              # standalone app manifest (actions under application.runtimeManifest)
actions/upload-image/        # writes a base64 image to public/images/, returns URL
actions/list-images/         # lists stored images + public URLs
actions/delete-image/        # deletes an image (guarded to public/images/)
web-src/src/components/App.js # UI: upload form + gallery
```

## Develop
```bash
npm install
aio app use          # select org / project / workspace
aio app run          # local dev (Files SDK requires this, not `aio app dev`)
aio app deploy       # build + deploy to Adobe I/O Runtime
npm test             # run action unit tests
```

Action URLs are injected into `web-src/src/config.json` automatically at
deploy/preview time — never hardcode them.
