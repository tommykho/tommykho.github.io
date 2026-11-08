[Visit Website](https://tommykho.github.io/)

# tommykho.github.io
To view my GitHub Portal, a collection of my source codes showcasing all of my open source projects, check out https://tommykho.github.io/

## Featured sites

| Site | Repo |
|---|---|
| [About](https://tommykho.github.io/about/) | this repo, `about/` (formerly tommykho/about) |
| [Sun Tzu · Modern Field Manual](https://tommykho.github.io/suntze/) | [tommykho/suntze](https://github.com/tommykho/suntze) |
| [Five Rings · Modern Field Manual](https://tommykho.github.io/fiverings/) | [tommykho/fiverings](https://github.com/tommykho/fiverings) |
| [Hopbit](https://tommykho.github.io/hopbit/) | [tommykho/hopbit](https://github.com/tommykho/hopbit) |

## Production and stage

One Pages site, two channels, built by `.github/workflows/pages.yml`:

| Branch | URL | Notes |
|---|---|---|
| `main` | https://tommykho.github.io/ | production |
| `stage` | https://tommykho.github.io/stage/ | beta: `noindex`, STAGE badge |

A push to either branch deploys, and each deploy rebuilds both channels. The `github-pages` environment must allow both `main` and `stage`. Merge `stage` into `main` to promote. Keep the workflow file the same on both branches. Link to sister sites with root paths (`/about/`, `/suntze/`) so links work from `/stage/` too.

## About page

- `about/index.html` — the About page, styled as an engineering drawing (title block, callouts, specs, bill of materials, assemblies, general notes)
- `assets/css/about.css`, `assets/js/about.js` — blueprint (dark, default) and paper (light) themes; the toggle stores `th-theme` in `localStorage`
- `assets/images/profile.webp` / `profile.jpg` — portrait used by About and the home teaser

## Home page structure

- `index.html` — hero (panning mountains, 3D dragon, socials), ribbon manifesto, featured sites, toolkit, about teaser, labs, footer
- `assets/css/home.css` — all home styles
- `assets/js/home.js` — reveals, ribbon canvas, stacking panels, spotlight (vanilla JS)

## Getting Started

To begin using this code, choose one of the following options to get started:
* [Download the latest release](https://github.com/tommykho/)
* Clone the repo: `git clone https://github.com/tommykho/about.git`
* Fork the repo

## Bugs and Issues

Have a bug or an issue with this template? [Open a new issue](https://github.com/tommykho/issues) here on GitHub or leave a comment

## Creator

Start Bootstrap was created by and is maintained by **[Tommy Ho](mailto://tommyho510@gmail.com)**

## Copyright and License

This project is licensed under the [GNU General Public License v3.0 (GPL-3.0)](https://github.com/tommykho/edgetts/blob/main/LICENSE).

## Support

If you find this useful, consider buying me a coffee!

[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue?logo=paypal)](https://paypal.me/tommykho)
