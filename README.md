# Rush Hour — American Classics

A playable browser remake of the classic sliding-block puzzle, styled as a nostalgic American roadside garage spanning the 1940s through the 1970s.

## Built entirely in ChatGPT Codex

The complete application—concept, generated artwork, implementation, debugging, testing, documentation, GitHub publishing, and deployment—was produced end to end within ChatGPT Codex.

- **Build Web Apps** was invoked in the original prompt and used to create the playable React experience.
- **The in-app Browser** provided the live game preview and annotation workflow. It was used to identify that the vertical Woodside Wagon was half hidden and not centered, then verify the repair.
- **Sites** packaged and deployed the finished game at the published URL below.

## Play

**[Play Rush Hour — American Classics](https://rush-hour-american-classics.az9713.chatgpt.site)**

Select an automobile and move it with the brass arrow controls or your keyboard. Clear the center lane and guide the scarlet fastback through the exit.

![Rush Hour — American Classics](public/assets/rush-hour-concept.png)

## Features

- Four playable, era-linked puzzles spanning the 1940s through the 1970s
- Classic American automobile artwork
- Mouse, touch, keyboard, and on-screen movement controls
- Undo, restart, sound, move counter, and locally saved best scores
- Responsive desktop and mobile layouts
- Era selection loads the matching puzzle and visual treatment

## Development journey

Read [DEVELOPMENT_JOURNEY.md](DEVELOPMENT_JOURNEY.md) for the complete build, browser-testing, publishing, debugging, and deployment history.

## Local development

```bash
npm install
npm run dev
```

Run the checks and production build with:

```bash
npm test
npm run build
```
