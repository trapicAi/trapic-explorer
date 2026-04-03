# Trapic Explorer

Interactive knowledge trace visualization. Browse historical events structured as causal chains of decisions, facts, conventions, and state changes.

Live at: [trapic.ai/trapic-explorer](https://trapic.ai/trapic-explorer/)

## What it does

Trapic Explorer renders curated datasets as explorable timelines. Each trace is a discrete historical event with:

- **type** — `decision`, `fact`, `convention`, or `state`
- **caused_by** — references to parent traces, forming causal chains
- **tags** — categorization (era, region, domain)
- **confidence** — `high`, `medium`, or `low`

Users can filter by tags and types, search by keyword, and follow causal chains to see how events connect across time.

## Datasets

Datasets live in `data/`. Each dataset has:

```
data/<dataset>/
  meta.json          # name, icon, tag taxonomy, category list
  <category>.json    # array of ExplorerTrace objects
```

See `src/types/trace.ts` for the full `ExplorerTrace` schema.

Current datasets:
- **Wars & Conflicts** — WW1, WW2, Greco-Persian Wars, Vietnam War
- **Chinese Dynasties** — 5,000 years from Xia to modern era (Traditional Chinese)

## Running locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Tech stack

- React 19 + TypeScript + Vite
- React Router for client-side routing
- Lucide React for icons
- CSS custom properties for theming (light/dark)
- Deployed on Cloudflare Pages

## License

MIT
