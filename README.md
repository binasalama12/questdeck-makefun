[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/binasalama12/questdeck-makefun/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/binasalama12/questdeck-makefun/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

# Quest Deck

Quest Deck is a static, browser-only explorer for make.fun. It reads the public API at runtime and turns open competitions into a searchable deck of quests, with detail pages, leaderboards, and builder profiles. It uses plain HTML, CSS, and JavaScript with no build step, external assets, API keys, or signing.

## Run locally

Use Node 22 or newer:

```sh
node serve.ts
```

Then open [http://localhost:8080](http://localhost:8080). To build the judge dossier, run:

```sh
node main.ts
```

The dossier is written to `/output` by default. Set `MAKEFUN_OUTPUT_DIR=out` to write it to a local `out/` directory instead.

## Routes

- `#/` — the open quest deck, with category filters and search.
- `#/bounty/<slug>` — a quest brief, payout details, deadline, and entry requirements.
- `#/leaderboard` — standings for an open quest, defaulting to the quest with the most submissions.
- `#/profile/<handle>` — a public builder profile, record, and solutions.

All app data comes from read-only GET requests to `https://make.fun/api`. A failed request is shown as an error state in the page.
