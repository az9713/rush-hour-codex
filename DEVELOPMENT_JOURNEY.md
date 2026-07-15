# Development journey: Rush Hour — American Classics

Rush Hour — American Classics began as a one-sentence creative brief and ended as a tested React game, a private Sites deployment, and a public GitHub repository. This document records the complete path: product interpretation, visual generation, implementation, browser feedback, deployment failures, fixes, verification, and the final repository state.

## Project at a glance

| Item | Final value |
|---|---|
| Original request | Create the classic Rush Hour game with classic U.S. automobiles and evoke nostalgia from the 1940s through the 1970s |
| Application type | Single-page React and Vite browser game |
| Local development URL | http://127.0.0.1:4173/ |
| Published URL | https://rush-hour-american-classics.az9713.chatgpt.site |
| GitHub repository | https://github.com/az9713/rush-hour-codex |
| Final application code commit | 05293174b3d247772a3c11c2cd6f7073f30bc2c4 |
| Hosting state | Successfully deployed on Sites; access remains owner-only |
| Final puzzle count | Four, one for each era from the 1940s through the 1970s |

> **Access note:** Sites was deliberately left in owner-only mode. An ordinary unauthenticated browser may receive a privacy-preserving 404 even when the deployment itself is healthy.

## The original product brief

The initial prompt asked for the classic Rush Hour sliding-block game, but replaced generic plastic pieces with classic American automobiles. The emotional requirement mattered as much as the mechanics: the game needed to evoke roadside America, postwar motoring, diners, Route 66, chrome trim, faded signs, and vehicles spanning four decades.

> “Create the classic Rush Hour Game with classic US automobiles. should invoke a nostalgic sentiments fo 1940s to 1970s”

### Request-by-request chronology

| User request or observation | How it changed the work |
|---|---|
| Create the classic game with U.S. automobiles and 1940s–1970s nostalgia | Established the product, art direction, time span, and core puzzle mechanic |
| “can i play it in the browser” followed by “no. i want to play the game in the browser” | Shifted delivery from source-only output to a running local Vite app and browser-based iteration |
| The Woodside Wagon was “half hidden, not centered” | Triggered a focused vertical-sprite geometry repair |
| “publish this game” | Added Sites metadata, a worker entry point, packaging, versioning, and production deployment |
| Commit and push to <code>github.com/az9713/rush-hour-codex</code> with the published link | Created the Git history, configured GitHub, added the root README, and synchronized the published URL |
| Production screenshot showed HTTP 404 | Triggered access-policy inspection, authenticated health checks, build-layout diagnosis, and Sites version 2 |
| “Pick your Era does not work” | Replaced cosmetic era state with puzzle-loading behavior and added a missing 1940s puzzle |
| “Exit sign is obscured” | Triggered stacking, spacing, and responsive geometry fixes verified at desktop and mobile sizes |
| Write <code>DEVELOPMENT_JOURNEY.md</code> | Produced this durable record from conversation history, Git evidence, source files, tests, and deployment results |

The brief established four product goals:

1. Preserve the recognizable Rush Hour puzzle loop.
2. Make the experience immediately playable in a web browser.
3. Use classic U.S. automobile imagery instead of abstract blocks.
4. Create a coherent 1940s–1970s nostalgic art direction.

The final implementation retained those goals while adding practical browser-game features: drag input, keyboard movement, on-screen controls, undo, restart, sound, move counting, best-score persistence, responsive layouts, and multiple puzzles.

## Phase 1: Establishing the visual direction

The visual concept was defined before the interface was polished. The chosen direction combined a dark asphalt background with cream paper, aged teal, mustard, oxide red, brass controls, and restrained chrome. Typography and framing borrowed from garage signs, roadside postcards, diner menus, and mid-century advertisements.

Original imagery was generated for two purposes:

- A full visual concept established the page composition and nostalgic mood.
- A classic-car sprite sheet supplied the automobile artwork used by the puzzle pieces.

The sprite sheet was cropped into twelve individual transparent PNG files under <code>public/assets/cars/</code>. The original concept and source sheet were preserved as <code>public/assets/rush-hour-concept.png</code> and <code>public/assets/classic-cars.png</code>.

This asset-first approach made the cars the visual focus. CSS supplied the board, signs, panels, grid, controls, paper texture, and era palettes without requiring additional decorative image files.

## Phase 2: Building the first playable game

The application was implemented as a React single-page app using Vite. The primary runtime surfaces were:

| Surface | Responsibility |
|---|---|
| <code>src/game.js</code> | Board size, puzzle definitions, collision grid, legal move ranges, movement, and win detection |
| <code>src/main.jsx</code> | React state, input handling, rendering, scoring, sound, puzzle selection, and win UI |
| <code>src/styles.css</code> | Nostalgic theme, board and vehicle layout, controls, responsive behavior, and animation |
| <code>test/game.test.js</code> | Puzzle validity, a known solution path, and occupancy behavior |
| <code>scripts/stage-sites.mjs</code> | Converts the Vite build into the directory structure expected by Sites |

### Board representation

The board is a six-by-six grid. Each automobile has:

- a stable ID;
- a grid position;
- a length of two or three cells;
- a horizontal or vertical axis;
- a sprite index;
- a display name; and
- an optional target flag.

The red target car is the Scarlet Fastback. A puzzle is solved when that car reaches the last legal horizontal position on the exit row.

### Collision and movement

The movement engine builds an occupancy grid from the current vehicle list. When a car moves, its own cells are temporarily ignored, then the engine scans along the permitted axis to find the minimum and maximum legal coordinates.

This produces one consistent rule for all input methods. Dragging, keyboard arrows, and brass on-screen arrows all eventually update the same grid-coordinate model.

### Interaction state

The React application tracks the selected puzzle, vehicle positions, move count, history, selected car, sound state, win state, and locally stored best score. Undo restores a cloned prior position. Restart reloads the current puzzle. Best scores are stored per puzzle in browser local storage.

Audio uses a small Web Audio oscillator rather than external sound files. Movement, invalid movement, undo, and victory use different tones.

### Initial verification

The first automated test suite checked:

1. every puzzle starts within the board without overlapping pieces;
2. Sunday Drive can be solved in six moves; and
3. occupancy calculations can ignore the vehicle currently being moved.

The local production build and all three tests passed before the first publication attempt.

## Phase 3: Making the game playable in the browser

The user explicitly clarified that the goal was not merely to receive source code: the game needed to be playable in the browser. The Vite development server was run at http://127.0.0.1:4173/ and the game was opened in the in-app browser.

This changed the workflow from code-only implementation to an iterative rendered-product loop:

1. run the local app;
2. inspect the actual page;
3. interact with the game;
4. compare visible behavior with the intended layout;
5. patch the smallest relevant source area; and
6. reload and verify again.

The browser view exposed problems that a successful build could not detect.

## Phase 4: Correcting the vertical vehicle artwork

The first visual issue reported in the browser concerned the Woodside Wagon. Its vertical sprite appeared half hidden and was not centered in its logical grid footprint.

The cause was the relationship between the long horizontal source artwork and its rotated vertical presentation. A vertical car needs its rendered dimensions exchanged, then it must rotate around its center rather than around the original image box.

The fix centered the image at 50%/50%, scaled its width and height according to vehicle length, and applied:

<code>translate(-50%, -50%) rotate(90deg)</code>

The change kept the logical button aligned to grid cells while centering the artwork inside that button. This repair was completed before the initial repository publication, so it is part of the first commit rather than a separate later commit.

## Phase 5: Preparing Sites hosting

Sites hosting was enabled by adding <code>.openai/hosting.json</code>. The file stores only the Sites project ID, keeping transient credentials and deployment details out of the repository.

The first hosting adapter produced:

- <code>dist/server/index.js</code>, a Cloudflare Worker-compatible ESM entry point;
- <code>dist/.openai/hosting.json</code>, the copied hosting metadata; and
- the standard Vite browser files.

The worker attempted to serve the requested asset through the Sites asset binding. If the requested route returned 404, it retried with <code>/index.html</code> to support a single-page application root route.

The source was committed, pushed to the private Sites source repository, packaged, saved as Sites version 1, and deployed. Sites reported the deployment as succeeded and returned the production URL.

## Phase 6: Publishing the GitHub repository

The project was initialized as a Git repository on <code>main</code>. The first commit captured the complete playable app, tests, artwork, hosting configuration, and build adapter.

The requested GitHub repository was configured as <code>origin</code>:

https://github.com/az9713/rush-hour-codex

The Sites source repository was retained as a second remote named <code>sites</code>. This created two publication destinations from the same source commit:

- <code>origin</code> for the public GitHub project;
- <code>sites</code> for the deployment source used by Sites.

A root <code>README.md</code> was added in the second commit with the published game link, feature overview, screenshot, and local development commands.

## Phase 7: Diagnosing the production 404

The first production screenshot showed HTTP 404 at the exact Sites URL even though the Sites deployment status was “succeeded.” Two distinct hosting behaviors had to be separated.

### The access-control hypothesis

Sites reported the project access mode as custom, with only the owner explicitly allowed. A private Sites app may intentionally return 404 to an unauthenticated browser so the app's existence is not disclosed.

That explained why a normal Chrome session could still see a 404 after a healthy private deployment. Access was not changed because making the game public is a meaningful permission change and required explicit approval.

### The build-layout defect

An authenticated health check also returned 404 for version 1. That proved privacy was not the only problem.

The packaged Vite files were initially placed directly under <code>dist/</code>:

~~~text
dist/
  index.html
  assets/
  server/index.js
  .openai/hosting.json
~~~

Sites expected emitted client assets under <code>dist/client/</code>. The worker was deployed, but the asset binding could not find either the root page or its fallback file.

### The packaging fix

<code>scripts/stage-sites.mjs</code> was changed to move ordinary Vite output into <code>dist/client/</code> after the Vite build:

~~~text
dist/
  client/
    index.html
    assets/
  server/
    index.js
  .openai/
    hosting.json
~~~

The repaired artifact passed:

- the game tests;
- the Vite production build;
- a local worker-level request using a mock asset binding; and
- the Sites packaging validator.

The exact source commit was pushed to the Sites source branch, saved as Sites version 2, and privately deployed.

An authenticated root check initially returned 404 during edge propagation. A focused follow-up probe then confirmed HTTP 200 for:

- <code>/</code>;
- <code>/index.html</code>;
- the hashed JavaScript bundle; and
- the hashed CSS bundle.

This confirmed the package was correct and the temporary second 404 was propagation, not another source defect.

## Phase 8: Fixing “Pick Your Era”

Rendered browser testing later showed that the era buttons appeared active but did not change the actual puzzle. Clicking “60s,” for example, changed the application class to <code>era-60s</code> while the heading remained “Sunday Drive · 01.”

The original implementation treated the selected era as independent cosmetic state. It changed CSS variables but did not load the puzzle associated with that decade.

The repair made era a property derived from the active puzzle instead of an independent state value. The new selection flow:

1. receives the clicked decade;
2. finds the puzzle whose <code>era</code> matches that decade;
3. calls the existing level-loading function; and
4. resets pieces, moves, history, win state, selection, and best-score display consistently.

Each era button also received <code>aria-pressed</code> so its state is exposed to assistive technology and browser automation.

### Adding the missing 1940s puzzle

The interface offered a “40s” button, but the original puzzle data contained only 1950s, 1960s, and 1970s levels. A fourth valid puzzle was added:

| Era | Puzzle |
|---|---|
| 1940s | Victory Boulevard · 04 |
| 1950s | Sunday Drive · 01 |
| 1960s | Main Street · 02 |
| 1970s | Scenic Route · 03 |

Victory Boulevard uses the same verified logical traffic arrangement with a different period-inspired vehicle selection and copy. The puzzle tray was expanded to four desktop columns and a two-by-two mobile layout.

## Phase 9: Fixing the obscured EXIT sign

The EXIT sign originally sat behind the board with a negative z-index and extended beyond the board into space that the layout had not reserved. At narrower desktop widths, it was covered or clipped at the right edge. On mobile, the board reserved 30 pixels while the sign extended approximately 53 pixels.

The final layout repair changed both stacking and geometry:

- the board stage became a controlled stacking context;
- the board frame sits above the sign;
- the sign uses a visible positive z-index;
- the wide desktop era panel receives additional separation from the board;
- the mid-size grid reserves a 72-pixel right-side exit lane; and
- the mobile board reserves 64 pixels for the sign.

The goal was not merely to bring the sign to the front. The layout now allocates physical space for it, preventing the fix from becoming a new overlap elsewhere.

## Phase 10: Browser QA for the final state

The final browser test defined one explicit flow:

<code>local game loads → click each Pick Your Era button → matching puzzle and selection appear → EXIT remains fully visible</code>

The in-app browser verified:

| Check | Result |
|---|---|
| Correct URL and page title | Pass |
| Meaningful DOM content rendered | Pass |
| No framework error overlay | Pass |
| No relevant console warnings or errors | Pass |
| 40s loads Victory Boulevard · 04 | Pass |
| 50s loads Sunday Drive · 01 | Pass |
| 60s loads Main Street · 02 | Pass |
| 70s loads Scenic Route · 03 | Pass |
| EXIT visible at 935×698 | Pass |
| EXIT visible at 390×844 | Pass |

The desktop measurement placed the sign's right edge at approximately 873.8 pixels inside a 935-pixel viewport. The mobile measurement placed it at approximately 357.2 pixels inside a 390-pixel viewport.

The responsive viewport override was reset after testing. Desktop and mobile screenshots were captured outside the repository as temporary QA evidence.

## Phase 11: Final deployment and synchronization

After browser QA:

1. the three source changes were staged;
2. commit <code>0529317</code> was created;
3. the commit was pushed to the private Sites source repository;
4. the production build was regenerated from that exact commit;
5. the package validator accepted the artifact;
6. Sites version 3 was saved;
7. the version was privately deployed;
8. deployment status reached “succeeded”;
9. an authenticated production health check returned HTTP 200 with <code>text/html</code>; and
10. the same commit was pushed to GitHub <code>origin/main</code>.

This exact-source workflow ensures the GitHub state, Sites source state, and packaged deployment correspond to the same commit.

## Git history

| Commit | Date | Purpose |
|---|---|---|
| <code>5051760</code> | 2026-07-14 21:50 PDT | Publish the complete initial game, generated artwork, tests, and Sites configuration |
| <code>92f0c09</code> | 2026-07-14 21:57 PDT | Add the root README and published game link |
| <code>72576a2</code> | 2026-07-14 22:17 PDT | Move Vite assets into <code>dist/client</code> for Sites |
| <code>0529317</code> | 2026-07-14 22:39 PDT | Make era buttons load puzzles, add the 1940s puzzle, and repair EXIT layout |

## Tooling friction and recovery

Two implementation details are worth preserving because they affected the development path.

### Windows patch sandbox

The normal patch editor could not prepare its Windows restricted-token sandbox for this workspace. A local patch utility also failed with an access error. The recovery used narrow PowerShell string replacements against exact known source fragments.

Each direct edit was followed by:

- a full Git diff inspection;
- <code>git diff --check</code>;
- the automated test suite;
- the production build; and
- rendered browser verification where relevant.

This prevented the fallback editing method from widening the change scope.

### Deployment health versus browser access

Sites deployment status alone was not enough to prove the route worked. The reliable diagnostic sequence became:

1. inspect Sites deployment status;
2. inspect the site access policy;
3. make an authenticated production request;
4. probe the root, fallback page, JavaScript, and CSS paths when needed; and
5. distinguish a private-access 404 from a missing-artifact 404.

That distinction was the key to resolving the production incident correctly.

## Reproducing the current project locally

Install the dependencies:

~~~bash
npm install
~~~

Start the browser development server:

~~~bash
npm run dev
~~~

Open:

~~~text
http://127.0.0.1:4173/
~~~

Run the automated checks:

~~~bash
npm test
~~~

Build the Sites-ready production artifact:

~~~bash
npm run build
~~~

The build command runs Vite first, then <code>scripts/stage-sites.mjs</code> to create the Sites-compatible <code>dist/client</code>, <code>dist/server</code>, and <code>dist/.openai</code> structure.

## Final state

The final application is a complete browser game with:

- four playable era-linked puzzles;
- generated classic American automobile artwork;
- drag, keyboard, and on-screen movement;
- undo, restart, sound, moves, and local best scores;
- responsive desktop and mobile layouts;
- a centered vertical-car rendering strategy;
- a fully visible EXIT sign;
- automated game-logic tests;
- a Sites-compatible production package;
- a successful private Sites deployment; and
- a synchronized public GitHub repository.

The remaining product decision is access. The deployed URL is healthy, but the Sites access policy is still owner-only. Making it public should be performed as an explicit permission change rather than as an incidental deployment step.

## Lessons carried forward

1. A successful build does not prove a rendered interaction works.
2. A successful deployment status does not prove the requested route resolves.
3. Private-hosting 404s and missing-artifact 404s require different fixes.
4. Hosting adapters must match the platform's expected output layout exactly.
5. Controls should change meaningful product state, not merely visual state.
6. Decorative elements that extend outside a component need reserved layout space.
7. Responsive QA should include measured geometry, not screenshots alone.
8. The deployed artifact, hosting source branch, and public repository should all trace to the same commit.
