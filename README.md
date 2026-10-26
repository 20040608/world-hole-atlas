# World Hole Atlas

A 3D hole-eating world tour, extended from [SamadiPour/snack-hole-game](https://github.com/SamadiPour/snack-hole-game) (MIT). Original license and asset credits are preserved in LICENSE and CREDITS.md.

## New expedition

- 12 seeded fictional districts across seven continents: Tashkent, Samarkand, Tokyo, Dubai, Paris, London, New York, Rio de Janeiro, Cairo, Cape Town, Sydney and Antarctica.
- 12 separately modelled, edible low-poly landmarks, including a TV tower, Registan-inspired architecture, pagoda, desert spire, Eiffel-inspired tower, clock tower, pyramid and harbour opera house.
- Untimed exploration and a three-minute rush; moving traffic and pedestrians; growth from street objects to entire buildings.
- Travel directly between destinations. All destinations are playable immediately.
- Local passport: best clearance, three stars per destination (25%, 65%, 98%), landmark collection and four hole colours. Progress saves every ten seconds and when leaving a district. Partial runs do not restore exact object positions.
- Live edible-object radar, landmark targets, dash/vortex/mega abilities, keyboard, mouse, touch and controller input.
- Automatic/low/high graphics settings, sound toggle, auto-pause in background tabs, responsive interface and existing PWA support.
- Original incremental game remains available at `?classic`.

These are stylized, separate procedural districts, not a continuous geospatial Earth replica. Single-player only: no online multiplayer, server leaderboard or cloud save.

## Run

Requires Node.js 24+ and WebGL 2.

```sh
npm ci
npm run dev
npm test
npm run build
```

Move with WASD/arrows, the mouse, touch drag or a gamepad. Abilities: Space/1 = Dash, 2 = Vortex, 3 = Mega. Escape pauses. A phone uses the visible ability buttons.

Low graphics is available for integrated GPUs. If WebGL 2 is unavailable the game shows a diagnostic instead of a blank screen.

## GitHub Pages

Create a public repository, push this checkout to its `main` branch, and select **Settings → Pages → Source → GitHub Actions**. The included workflow tests, builds with the repository subpath and deploys. It does not upload to the upstream author's itch.io account or require their credentials.

## Verification

`npm test` includes the original suite plus expedition tests covering all twelve deterministic districts, starter food, growth simulations, landmark geometry bounds, timer expiry, ability cooldowns and malformed saved data. `npm run build` checks TypeScript and generates the production bundle. Cloud Browser in this environment reports no WebGL 2; GPU rendering and real-device performance still require a WebGL-capable browser.
