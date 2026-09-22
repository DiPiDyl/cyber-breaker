# ⚡ CYBER-BREAKER: Roguelike Pong & Breakout

[![Play Online](https://img.shields.io/badge/🎮_PLAY_NOW-GitHub_Pages-00f2fe?style=for-the-badge)](https://dipidyl.github.io/cyber-breaker/)
[![License: MIT](https://img.shields.io/badge/License-MIT-4facfe.svg?style=for-the-badge)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-success.svg?style=for-the-badge)](#architecture)
[![Tech: HTML5 Canvas & Web Audio](https://img.shields.io/badge/Tech-HTML5_Canvas_+_Web_Audio-ff007f?style=for-the-badge)](#architecture)

> **A high-octane roguelike arcade fusion of classic Pong and Breakout, packed with 25 distinct combat paths, 250+ upgrades, 68 synergistic fusions, and multi-phase boss encounters.**

---

## 🚀 Play Online Immediately

You can play **CYBER-BREAKER** right now in any modern browser (desktop or mobile) with zero installation:

* 🌐 **Primary (GitHub Pages)**: [**Play on GitHub Pages**](https://dipidyl.github.io/cyber-breaker/)
* 🔗 **Alternative (HTMLPreview)**: [**Play via HTMLPreview**](https://htmlpreview.github.io/?https://github.com/DiPiDyl/cyber-breaker/blob/main/index.html)
* ⚡ **Alternative (GitHack CDN)**: [**Play via Raw GitHack**](https://raw.githack.com/DiPiDyl/cyber-breaker/main/index.html)

*(Note: Raw `githubusercontent.com` links serve `text/plain` for security; use the GitHub Pages link above for direct execution!)*

---

## 🎯 Short Repository Description

> **CYBER-BREAKER** is an action-packed roguelike Pong & Breakout arcade fusion featuring 25 distinct combat paths, 250+ upgrades, 68 fusions, and multi-phase boss battles against Chief Architect Bennie. Zero dependencies, pure vanilla HTML5/JS.

*(You can paste the above one-liner directly into the "About" description of your GitHub repository).*

---

## 🕹️ Game Features

* **25 Unique Combat Paths**: Choose your archetype on Floor 2—from *Kinetic*, *Pyro*, *Cryo*, *Electro*, *Gravity*, and *Chrono* to *Nanite Swarm*, *Gambler*, *Quantum*, *Vampiric*, and the secret *Inventor*.
* **250+ Upgrades & 68 Fusions**: Deep synergy system combining upgrades into game-changing fusion protocols (e.g. *Superconductor*, *Cryo-Concussion*, *Void Singularity*, *Tachyon Overdrive*).
* **Chief Architect Bennie Boss Encounter**:
  * **3 Distinct Combat Phases**: Diagnostic sweeps, unstable prototype bounce gears, and overclocked laser arrays.
  * **Interactive Mechanics**: High-speed bumper rebounds, aim-locked sweeping death rays, 1.5-second stagger counter-attack windows (1.5x damage bonus), and armed escort micro-drones.
  * **Secret Unlockables**: Defeating Bennie on 0 HP permanently unlocks the *Bennie Bouncer* paddle skin and the *Inventor* path in your Codex.
* **Diverse Game Modes**:
  * **Sector Roguelike Campaign**: Floor progression with Elite encounters, Mystery events, Shop nodes, and Boss sectors.
  * **Cyber Heist**: Vault breach mode with data core extractions and escalating security grids.
  * **Swarm Survival**: Endless projectile evasion and defensive crowd control.
  * **Duel Arena**: Pure 1v1 tactical paddle combat.
  * **Breakout Arcade**: Classic brick destruction with modern physics and active abilities.
* **Black Market & Workshop**: Build custom loadouts before major boss encounters and unlock permanent meta-upgrades with Cyber Credits.
* **Persistent Codex**: Lore dossier, unlocked paths, discovered fusions, and achievement tracking saved locally in `localStorage`.
* **100% Frozen Global Pause System**: Fully pause the action with `Esc` or `P` at any time—even during bullet-hell boss attacks—with zero damage leakage, zero timer drift, and instant resumption.

---

## 🎮 Controls & Keybindings

| Action | Primary Input | Secondary / Alternative |
|:---|:---|:---|
| **Move Paddle** | Mouse Movement | `A` / `D` or `Left` / `Right` Arrow Keys |
| **Launch Ball / Fire Weapons** | Left Mouse Click | `Spacebar` |
| **Active Path Ability** (e.g. Kinetic Shockwave) | Right Mouse Click | `Q` or `Shift` |
| **Global Pause / Resume** | `Esc` | `P` or Pause Button in Top HUD |
| **Select Upgrade Cards** | Left Mouse Click | Number Keys `1` - `4` |
| **Admin Console** *(Cheats/QA)* | Top HUD Secret Button | Access Code: `admin123` |

---

## 🏗️ Architecture & Zero-Dependency Design

CYBER-BREAKER is built from scratch in pure vanilla web technologies with **zero external libraries, zero frameworks, and zero CDN dependencies**:

* **Standalone Deliverable (`index.html`)**: The entire game engine, 25 paths, CSS neon aesthetic, sound synthesizer, and assets are bundled into a single file (~808 KB) that can be double-clicked to play offline.
* **Modular Source Code**:
  * `css/styles.css`: Cyberpunk UI layout, CRT scanline effects, dynamic HUD clusters, and animations.
  * `js/audio.js`: Procedural Web Audio API sound synthesizer (no external MP3/WAV files required).
  * `js/constants.js`: Complete 25-path metadata registry, 250+ upgrade configurations, and fusion matrix.
  * `js/rooms.js`: Procedural floor generation, shop logic, mystery encounters, and boss arenas.
  * `js/game.js`: 60 FPS requestAnimationFrame loop, collision physics, boss AI, projectile systems, and save data management.

---

## 💻 Local Development & Bundling

### Running Locally
Simply open `index.html` in any web browser, or use a lightweight local static server:

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .
```

### Rebuilding `index.html` from Modular Source
When editing files inside `css/` or `js/`, run the bundling script in PowerShell to consolidate them into `index.html`:

```powershell
.\scripts\build_bundle.ps1
```

### Syncing Updates to GitHub (1-Click)
To automatically re-bundle, commit, and push future updates to GitHub:

```powershell
.\scripts\sync_github.ps1 -Message "Your update description"
```

---

## 🤖 Continuous Deployment (GitHub Pages)

The repository includes a automated GitHub Actions workflow (`.github/workflows/deploy-pages.yml`). Whenever you push changes to the `main` branch, GitHub Pages will automatically build and publish the latest version of the game within seconds.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
