# PlantyHub

E-commerce landing page for PlantyHub smart hydroponic gardens — inspired by [Click & Grow](https://eu.clickandgrow.com/) layout with PlantyHub brand identity.

## Stack

- React 19 + TypeScript + Vite
- MUI v9 · Nunito Sans · Brand colors (#4CAF50, #2B2B2B, #E8E5DA)

## Run

```bash
cd plantyhub.ui   # from repo root
npm install
npm run dev
```

## Page flow (Click & Grow-style)

1. Promo bar — free shipping
2. Nav — Home Gardens · Seed Pods · Accessories · Support
3. Campaign hero — Starter Bundle
4. **Sleek & Simple** — garden product carousel (Home Garden, Bundle, Refills)
5. **Seed Pods** — horizontal product cards
6. Accessories carousel
7. Plant care blog / press
8. Grow smarter, not harder — 3 benefits
9. Guarantees — sprouting promise, year-round, support, sustainable
10. Community testimonials — social-style quotes
11. Support — product specs + email signup
12. Footer — Smart Gardens, Seed Pods, Shop & Learn, PlantyHub

## Languages

English, **Български**, Deutsch, Français — switch via the globe icon in the header. Preference is saved in your browser.

## Customize

- Translations: `src/i18n/locales/` (`en.json`, `bg.json`, `de.json`, `fr.json`)
- Product catalog (prices, images): `src/data/catalog.ts`
- Brand theme: `src/theme.ts`
- Sections: `src/sections/`
