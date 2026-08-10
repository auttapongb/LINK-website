# Asset credits & licences

Almost every third-party asset used by this site is free for commercial use with
no attribution requirement. There is one flagged exception — the iBerry mark,
recorded under [Partner brand marks](#partner-brand-marks) below.

Nothing is hot-linked: all imagery is downloaded into `public/assets/` so the
site works offline and does not depend on an external CDN at runtime.

## The LINK logo

The LINK mobius mark and wordmark were supplied by the brand owner as a raster
PNG, kept verbatim at `public/assets/brand/link-logo.png` as the source of truth.
Everything the site renders is a vector redraw of that file, measured off it
pixel by pixel rather than traced by eye.

| File | What it is |
| --- | --- |
| `link-logo.png` | The supplied original. Reference only; never rendered. |
| `link-mark.svg` | The ribbon alone. |
| `link-lockup.svg` | Ribbon over wordmark — the primary lockup, used in header, drawer and footer. |
| `favicon.svg` | Square icon cut, ribbon boldened so it survives 16 px. |
| `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png`, `og-image.jpg` | Generated from the SVGs by `scripts/brand-assets.mjs`. |

The ribbon is one closed curve of uniform 13-unit width, mirror symmetric about
both axes through (138.9, 44.5), painted twice so colour travels *along* the
ribbon rather than straight across the box: a warm pass over the whole loop, then
a cool pass over the half running from the right tip through the crossing to the
left tip. The wordmark's four glyphs are entirely straight-edged in the original,
so they are reproduced as measured polygons instead of being set in a substitute
typeface. The same path data is shared with the site's JavaScript in
`src/js/brand.js`, so the chrome, the home hero and the earn-to-burn loop animate
one definition rather than three copies that drift.

Palette tokens in `src/styles/tokens.css` were resampled from the supplied PNG:
`--color-brand` moved off a generic blue onto the mark's blue, and the mark's
bronze/orange half replaced the site's previously unrelated gold as the warm
accent family.

## Photography — Unsplash

All photographs are covered by the [Unsplash License](https://unsplash.com/license):
free for commercial and non-commercial use, no permission or attribution required.

Machine-readable details (dimensions, byte sizes, verified subject) live in
`public/assets/photos/manifest.json`.

| File | Photographer | Source |
| --- | --- | --- |
| `hero-family.webp` | Daria | [Unsplash](https://unsplash.com/photos/a-family-posing-for-a-picture-in-the-woods-ZLtM9l_9nGI) |
| `commute.webp` | Joshua Rawson-Harris | [Unsplash](https://unsplash.com/photos/people-standing-on-train-station-during-daytime-Dy178VIBO18) |
| `groceries.webp` | Markus Winkler | [Unsplash](https://unsplash.com/photos/two-people-walking-through-a-market-with-fruit-and-vegetables-_32teXYhzpY) |
| `mobile.webp` | Chris Yang | [Unsplash](https://unsplash.com/photos/woman-leaning-back-on-white-wall-and-using-smartphone-EcWOVYEe87s) |
| `dining.webp` | National Cancer Institute | [Unsplash](https://unsplash.com/photos/family-eating-at-the-table-BQPi8F_UON0) |
| `getaway.webp` | Anton Lammert | [Unsplash](https://unsplash.com/photos/a-resort-with-a-swimming-pool-surrounded-by-palm-trees-Esf0lVbV2Dc) |
| `usecase-friends.webp` | Setengah Limasore | [Unsplash](https://unsplash.com/photos/friends-are-relaxing-and-chatting-together-outdoors-awiq8Yl1akU) |
| `usecase-travel.webp` | Duy Pham | [Unsplash](https://unsplash.com/photos/people-holding-shoulders-sitting-on-wall-Cecb0_8Hx-o) |
| `usecase-students.webp` | Maccy | [Unsplash](https://unsplash.com/photos/people-sitting-and-standing-inside-classroom-lYpzjpGuy6o) |
| `persona-nan.webp` | Vitaly Gariev | [Unsplash](https://unsplash.com/photos/smiling-woman-in-white-shirt-against-colorful-wall-TE-hl5u8qkA) |
| `persona-wit.webp` | Vitaly Gariev | [Unsplash](https://unsplash.com/photos/an-older-asian-man-in-a-plaid-shirt-dN-32CEr_O4) |
| `persona-ploy.webp` | Ereng hu | [Unsplash](https://unsplash.com/photos/a-smiling-young-woman-in-a-white-dress-outdoors-HOvnm0KYp7M) |

The persona portraits are stock photography standing in for the fictional
personas Nan, Wit and Ploy. They are illustrative and do not depict real
LINK users.

All files were requested from the Unsplash imgix CDN as WebP at the exact
display dimensions (`?fm=webp&w=…&h=…&fit=crop&q=…`), so no local
re-encoding step is needed. Every `<img>` carries explicit `width`/`height`
and, apart from the hero, `loading="lazy"`.

## Partner brand marks

All partner marks below are third-party trademarks reproduced at small size solely
for nominative identification within a non-commercial academic pilot concept. No
endorsement, sponsorship, or affiliation with any of these companies is implied or
claimed. Each mark remains the property of its respective owner. Files were
downloaded and are served locally rather than hot-linked, and none of the artwork
has been recoloured or redrawn — the site's neutral grey rendering is a CSS filter
applied at display time, reversed on hover.

Machine-readable details (intrinsic aspect ratio, optical scale, format) live in
`public/assets/brand/partners/manifest.json`.

### Lotus's

- **File:** `public/assets/brand/partners/lotuss.svg`
- **Source:** <https://upload.wikimedia.org/wikipedia/commons/c/c6/Lotus%27s_Logo.svg>
- **File description page:** <https://commons.wikimedia.org/wiki/File:Lotus%27s_Logo.svg>
- **Licence:** Public domain — Wikimedia Commons tags this file `{{PD-textlogo}}`:
  the logo consists only of simple geometric shapes and text and is below the
  threshold of originality required for copyright protection. The file also carries
  `{{Trademarked}}`.
- **Trademark holder:** Ek-Chai Distribution System Co., Ltd. (Lotus's), Charoen
  Pokphand Group.

### BTS

- **File:** `public/assets/brand/partners/bts.svg`
- **Source:** <https://upload.wikimedia.org/wikipedia/commons/e/ee/BTS-Logo.svg>
- **File description page:** <https://commons.wikimedia.org/wiki/File:BTS-Logo.svg>
- **Licence:** Public domain — tagged `{{PD-TextLogo}}` on Commons (simple
  geometric shapes and text, below the threshold of originality), plus
  `{{Trademark}}`.
- **Trademark holder:** Bangkok Mass Transit System Public Company Limited
  (BTS Skytrain), BTS Group Holdings PCL.

### AIS

- **File:** `public/assets/brand/partners/ais.svg`
- **Source:** <https://upload.wikimedia.org/wikipedia/commons/3/3b/Advanced_Info_Service_logo.svg>
- **File description page:** <https://commons.wikimedia.org/wiki/File:Advanced_Info_Service_logo.svg>
- **Licence:** Public domain — tagged `{{PD-textlogo}}` on Commons, plus
  `{{trademarked}}`. Credited on the file page to Advanced Info Service (AIS) PCL.
- **Trademark holder:** Advanced Info Service Public Company Limited (AIS).

### iBerry

- **File:** `public/assets/brand/partners/iberry.png`
- **Source:** iBerry's own website, retrieved from the Internet Archive because the
  original host no longer serves the site:
  <https://web.archive.org/web/20201206121509if_/http://www.iberryhomemade.com/assets/imgs/logo.png>
  (original URL `http://www.iberryhomemade.com/assets/imgs/logo.png`)
- **Licence:** **Trademark, used for identification. This is _not_ a free
  licence.** iBerry Group has no logo file on Wikimedia Commons, no Simple Icons
  entry, and no public press or brand-resources page, so the mark was taken from
  the company's own site and is reproduced here under nominative fair use only.
  Unlike the other four marks, no public-domain or free-licence tag applies to this
  file. It is the only asset on the site in that position, and it should be the
  first thing removed if this concept were ever used commercially.
- **Trademark holder:** iBerry Group (iBerry Homemade Co., Ltd.), Thailand.
- **Note:** This is the pre-2026 lowercase `iberry` logotype, and the only
  raster-only mark in the set (176 × 50 transparent PNG). The group announced a new
  identity in 2026 but has not published a downloadable version of it.

### IHG

- **File:** `public/assets/brand/partners/ihg.svg`
- **Source:** IHG's own corporate site:
  <https://www.ihgplc.com/~/media/Images/I/Ihg-Plc/logo/ihg_secondary_horizontal_logo_black_rgb_5.svg>
- **Licence:** Public domain as to copyright — the identical lockup is hosted on
  Wikimedia Commons as
  [File:IHG Hotels & Resorts logo.svg](https://commons.wikimedia.org/wiki/File:IHG_Hotels_%26_Resorts_logo.svg),
  tagged `{{PD-textlogo}}` (simple geometric shapes and text, below the threshold
  of originality) plus `{{Trademarked}}`. The first-party file from ihgplc.com was
  used instead of the Commons copy because it is the same artwork exported with
  simpler path geometry.
- **Trademark holder:** Six Continents Limited / InterContinental Hotels Group PLC
  (IHG Hotels & Resorts).

## Icons — Lucide

[Lucide](https://lucide.dev) v1, [ISC licence](https://github.com/lucide-icons/lucide/blob/main/LICENSE).
Installed from npm and imported icon-by-icon in `src/js/icons.js` so only the
17 icons actually used are bundled.

## Fonts — Google Fonts

Fraunces, IBM Plex Sans, Noto Sans Thai and Noto Serif Thai, all under the
[SIL Open Font License 1.1](https://openfontlicense.org/). Loaded from the
Google Fonts CSS API (unchanged from v1).

## Motion libraries

| Library | Licence |
| --- | --- |
| [GSAP](https://gsap.com) 3.15 (core, ScrollTrigger, SplitText) | Standard "No Charge" licence — free, including the formerly paid plugins, since 3.13 |
| [Lenis](https://github.com/darkroomengineering/lenis) 1.3 | MIT |

## Generated in-house

- The hero's animated gradient is a hand-written WebGL shader in
  `src/js/gradient.js`, not a third-party asset.
- The paper grain overlay is an inline SVG `feTurbulence` filter in
  `src/styles/atmosphere.css`, not an image file.
- The earn-to-burn loop diagram in `earn-to-burn.html` is hand-authored SVG.
- `og-image.jpg` is rendered from the site's own SVG lockup and web fonts by
  `scripts/brand-assets.mjs`.
- `public/assets/logo.svg` (the v1 placeholder mark) was removed once the real
  lockup landed.

## Considered and skipped

| Tool | Why it was not used |
| --- | --- |
| [ShaderGradient](https://github.com/ruucm/shadergradient) | The maintained API is React-only (`@shadergradient/react` + react-three-fiber). Adding React and Three.js to a vanilla multi-page site for one background was not worth roughly 400 KB of bundle. Replaced with a hand-written WebGL shader that uses the LINK palette directly. |
| [liquid-glass-js](https://github.com/dashersw/liquid-glass-js) | Its look is a heavy specular/refraction glass effect that reads as a glow — explicitly on the project's avoid list — and it clashes with the flat cool-pearl canvas. |
| [liquid-logo](https://github.com/paper-design/liquid-logo) | React + WebGL component for animating a single logo. Same React problem, and the LINK mark is a small nav-scale element where the effect would not be legible. |
| three / react-three-fiber | No genuine 3D content on this site. Would have added a large bundle for decoration only. |
| Lordicon | The free tier still requires an account for most of the library and the free icons carry attribution conditions. Lucide covers the same need with a clean ISC licence. |
| Motion One / `motion` | A good lightweight option, but GSAP was already needed for ScrollTrigger and SplitText. Running two animation engines would have cost more bytes than it saved. |
