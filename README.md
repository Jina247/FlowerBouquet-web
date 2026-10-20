# A Bouquet for You

An animated bouquet (built with Remotion) that blooms on screen. Tap the pink heart tag to open a letter.

## Run locally

```bash
npm install
npm run dev
```

Open the address it prints. To try it on your phone, run `npm run dev -- --host` and open the "Network" address on the same Wi-Fi.

## Edit the letter

Change `LETTER` at the top of `src/App.tsx`.

## Deploy on Vercel

Push this folder to GitHub and import it in Vercel. It is detected as a Vite project: build command `npm run build`, output folder `dist`. No extra settings needed.

## Files

- `src/Bouquet.tsx`: the bouquet animation (Remotion component)
- `src/App.tsx`: the page, the tag hint and the letter
- `src/index.css`: page and letter styles
