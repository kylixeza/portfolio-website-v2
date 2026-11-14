# Kylix: soft, modern split-stage portfolio

Reading this as: personal mobile-developer portfolio for recruiters and collaborators, with a soft, modern, simple split-stage visual language.

Dial: ENERGY 2 / RHYTHM 3 / MOTION 3.

## Direction and idea

- Direction: `split-stage` (The split stage) from `design-taste-frontend` (seed `2146717949`).
- Type: **Switzer** (`@fontshare`, weights 400 and 500) — single clean neo-grotesk across display, headings, and body so scale and tone carry hierarchy without clutter.
- Colour: **Rose grey, green** (`--bg: #ebe5e3`, `--surface: #e1dad7`, `--ink: #2b2622`, `--muted: #6a615d`, `--accent: #0f7d45`, `--accent-ink: #ffffff`) — soft, warm, modern neutral with deep forest-green reserved for the primary CV download action and active state.
- Idea: On this page, Kylix's shipped mobile apps and his portrait become a calm split stage where the visual proof stays pinned in view while the career ledger scrolls beside it.
- Live thing: An interactive **Work Ledger** with platform filter (`All`, `Android`, `Flutter`, `Compose`, `Web`) and live hover/focus stage switching — selecting or hovering a project updates the pinned stage preview on desktop (and inline detail on mobile) with its real artwork, platform tags, and store links.

## Layout and composition

- Desktop: two-column split stage (`46%` sticky visual stage on the left, `54%` scrolling editorial column on the right) with equal `clamp(1rem, 2.2vw, 2rem)` outer margins, broken once by the full-bleed closing contact & footer band.
- Hero: clean top bar (`Kylix` wordmark, 3 anchor links `Work`, `Experience`, `About`, plus `Download CV` action), bold two-line headline (`Kylix Eza Saputra` / `Mobile developer.`), one plain supporting sentence, and primary `Download CV` button (`#cv-preview` or printable CV sheet / direct download).
- Sections (each with a distinct composition):
  1. `Work` (`#work`): Quiet ledger with platform filter pills, 44px+ rows (project name, platform/type, links), and live stage preview sync.
  2. `Experience` (`#experience`): Asymmetric two-column timeline rows (period left, role/company/summary right) with current Lead role highlighted by scale and surface tone.
  3. `About` (`#about`): Founder's letter layout in a calm 46ch reading measure with inline 44px portrait, education/GPA, core stack, and personal sign-off.
  4. `Recognition` (`#recognition`): Multi-column typographic proof list (6 awards + 3 verified credentials/publications, ragged columns, zero boxes or logos).
  5. `Contact` (`#contact`): Single-field quick inquiry / message composer (`mailto:` handoff with subject/body prefilled) + direct email link.
  6. `Footer`: Full-bleed closing band over the atmospheric backdrop with large `Kylix Eza Saputra` wordmark, social links (`GitHub`, `LinkedIn`, `Email`), and image credits.
- Phone (`<= 900px`): sticky visual stage collapses cleanly into a top `48svh` rounded frame above the hero copy; work ledger shows inline 16:10 artwork for featured apps; single-column flow with zero horizontal overflow.

## Motion and CV download

- Motion (`MOTION 3`):
  1. Hero load choreography (masked line rise for `h1`, staggered lead/CTA reveal, shutter open on stage image, settled within 1.2s).
  2. Slow crossfade on the sticky stage as sections enter (`IntersectionObserver` updates active stage image) plus subtle continuous scale drift on the stage photograph.
  3. Per-section staggered reveals (`[data-reveal]`) for headings, rows, and letter paragraphs.
  4. Tactile hover/press feedback on filter controls, ledger rows, and `Download CV` button.
  5. Full `prefers-reduced-motion: reduce` fallback and `html.js` guard so all content is visible immediately with JS off.
- **CV Download**: Since no static PDF file exists in `public/`, the `Download CV` button opens a clean, print-ready ATS CV modal/sheet (or triggers `window.print()` / `.html` CV download) populated strictly from Kylix's real resume data (`src/pages/index.astro`), with a clear note if a custom PDF is to be dropped into `public/Kylix-Eza-Saputra-CV.pdf`.
