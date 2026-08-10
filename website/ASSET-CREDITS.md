# Asset credits & licences

Every third-party asset used by this site is free for commercial use with no
attribution requirement. Credits are recorded here anyway, as good practice.

Nothing is hot-linked: all imagery is downloaded into `public/assets/photos/`
so the site works offline and does not depend on an external CDN at runtime.

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

- `public/assets/logo.svg` — the LINK mark (unchanged from v1).
- The hero's animated gradient is a hand-written WebGL shader in
  `src/js/gradient.js`, not a third-party asset.
- The paper grain overlay is an inline SVG `feTurbulence` filter in
  `src/styles/atmosphere.css`, not an image file.

## Considered and skipped

| Tool | Why it was not used |
| --- | --- |
| [ShaderGradient](https://github.com/ruucm/shadergradient) | The maintained API is React-only (`@shadergradient/react` + react-three-fiber). Adding React and Three.js to a vanilla multi-page site for one background was not worth roughly 400 KB of bundle. Replaced with a hand-written WebGL shader that uses the LINK palette directly. |
| [liquid-glass-js](https://github.com/dashersw/liquid-glass-js) | Its look is a heavy specular/refraction glass effect that reads as a glow — explicitly on the project's avoid list — and it clashes with the flat cool-pearl canvas. |
| [liquid-logo](https://github.com/paper-design/liquid-logo) | React + WebGL component for animating a single logo. Same React problem, and the LINK mark is a small nav-scale element where the effect would not be legible. |
| three / react-three-fiber | No genuine 3D content on this site. Would have added a large bundle for decoration only. |
| Lordicon | The free tier still requires an account for most of the library and the free icons carry attribution conditions. Lucide covers the same need with a clean ISC licence. |
| Motion One / `motion` | A good lightweight option, but GSAP was already needed for ScrollTrigger and SplitText. Running two animation engines would have cost more bytes than it saved. |
