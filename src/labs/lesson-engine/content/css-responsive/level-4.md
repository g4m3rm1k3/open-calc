---
series: css-responsive
level: 4
title: Responsive Images and Media
lang: css
---

# Responsive Images and Media

A `<img src="photo.jpg">` with no CSS will render at the image's intrinsic size. On a 320px mobile screen, a 1200px photo will overflow the viewport and break the layout. Images need explicit CSS to behave responsibly.

This lesson covers three problems: making images fit their containers without distorting, preserving aspect ratios so layouts don't jump as images load, and serving different image resolutions for different screen densities.

By the end of this lesson you will be able to write the essential image CSS reset, use `object-fit` to control how images fill a container, use `aspect-ratio` to reserve space before images load, and use `srcset` and `sizes` to serve the right resolution to each device.

## The essential image reset

Every project needs this in its base CSS. Without it, images overflow their containers at their natural size.

```html
<div class="demo">
  <div class="panel">
    <div class="panel-label">Without max-width: 100%</div>
    <div class="img-container-bad">
      <div class="fake-img">400px wide image in a 200px container → OVERFLOW</div>
    </div>
  </div>
  <div class="panel">
    <div class="panel-label">With max-width: 100%</div>
    <div class="img-container-good">
      <div class="fake-img responsive">400px wide image — constrained to container</div>
    </div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 20px; font-family: system-ui; }
.demo { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.panel { background: #1e293b; padding: 14px; border-radius: 10px; overflow: hidden; }
.panel-label { color: #818cf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
.img-container-bad, .img-container-good { background: #0f172a; padding: 8px; border-radius: 6px; overflow: hidden; width: 160px; }
.fake-img { background: #6366f1; color: white; padding: 10px; border-radius: 4px; font-size: 11px; font-weight: 600; width: 280px; }
.fake-img.responsive { width: 100%; max-width: 100%; box-sizing: border-box; }
```

The global reset for responsive images: `img, video, svg { max-width: 100%; height: auto; display: block; }`. This single rule prevents the vast majority of image overflow issues. `height: auto` preserves the image's natural aspect ratio as it shrinks.

## object-fit — controlling how an image fills its box

When an image has an explicit width and height (as it should, to prevent layout shift), `object-fit` controls how the image scales within that box without distorting.

```html
<div class="fit-demo">
  <div class="fit-card">
    <div class="fit-img-wrap fi-fill">
      <div class="fake-photo">Photo content</div>
    </div>
    <div class="fit-label">fill (default) — stretches to fit, distorts</div>
  </div>
  <div class="fit-card">
    <div class="fit-img-wrap fi-contain">
      <div class="fake-photo">Photo content</div>
    </div>
    <div class="fit-label">contain — shows whole image, may leave gaps</div>
  </div>
  <div class="fit-card">
    <div class="fit-img-wrap fi-cover">
      <div class="fake-photo">Photo content</div>
    </div>
    <div class="fit-label">cover — fills box, may crop edges (most common)</div>
  </div>
  <div class="fit-card">
    <div class="fit-img-wrap fi-none">
      <div class="fake-photo">Photo content</div>
    </div>
    <div class="fit-label">none — ignores the box, uses natural size</div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 20px; font-family: system-ui; }
.fit-demo { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fit-card { background: #1e293b; border-radius: 8px; overflow: hidden; }
.fit-img-wrap { height: 100px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #0f172a; }
.fake-photo { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-size: 11px; font-weight: 700; padding: 10px; text-align: center; }
.fi-fill .fake-photo    { width: 180px; height: 100px; }
.fi-contain .fake-photo { width: 120px; height: 60px; }
.fi-cover .fake-photo   { width: 100%; height: 100%; }
.fi-none .fake-photo    { width: 200px; height: 120px; }
.fit-label { color: #64748b; font-size: 11px; padding: 8px 10px; line-height: 1.4; }
```

`object-fit: cover` is the workhorse — it fills the container and crops the edges. Combined with `object-position: center` (the default), it keeps the centre of the image visible. Perfect for hero images, thumbnails, and card images.

## aspect-ratio — preventing layout shift

Declaring `aspect-ratio` on an image's container (or the image itself) reserves space for it before it loads. Without it, the page jumps when images load — the dreaded Cumulative Layout Shift (CLS).

```html
<div class="ratio-demo">
  <div class="ratio-card">
    <div class="ratio-label">aspect-ratio: 16 / 9</div>
    <div class="ratio-box r16-9">
      <div class="img-placeholder">Widescreen image placeholder<br><small>Space reserved before image loads</small></div>
    </div>
  </div>
  <div class="ratio-card">
    <div class="ratio-label">aspect-ratio: 1 / 1</div>
    <div class="ratio-box r1-1">
      <div class="img-placeholder">Square</div>
    </div>
  </div>
  <div class="ratio-card">
    <div class="ratio-label">aspect-ratio: 4 / 3</div>
    <div class="ratio-box r4-3">
      <div class="img-placeholder">Standard photo</div>
    </div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 20px; font-family: system-ui; }
.ratio-demo { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.ratio-card { background: #1e293b; border-radius: 8px; overflow: hidden; }
.ratio-label { color: #818cf8; font-size: 11px; font-weight: 700; font-family: monospace; padding: 8px 10px; }
.ratio-box { width: 100%; overflow: hidden; background: #0f172a; display: flex; align-items: center; justify-content: center; }
.r16-9 { aspect-ratio: 16 / 9; }
.r1-1  { aspect-ratio: 1 / 1; }
.r4-3  { aspect-ratio: 4 / 3; }
.img-placeholder { color: #64748b; font-size: 11px; text-align: center; line-height: 1.5; padding: 8px; }
.img-placeholder small { color: #475569; font-size: 10px; }
```

**CS lens:** `aspect-ratio: 16 / 9` is syntactic sugar for the ancient "padding-top hack" (`padding-top: 56.25%` — the ratio expressed as a percentage). The browser now handles this natively. The key insight: browsers size elements based on their content by default. Setting an explicit aspect-ratio tells the browser "size this by its width and derive the height."

**SE lens:** CLS (Cumulative Layout Shift) is a Core Web Vitals metric. Google measures it and factors it into search ranking. Setting `width`, `height`, and/or `aspect-ratio` on images is one of the highest-impact CLS improvements available — and it's just three attributes.

**Common mistakes:**
- Setting `height: auto` without `max-width: 100%` — the image will still overflow horizontally.
- Using `object-fit: cover` without a defined height — the image collapses to 0px tall. Always pair it with an explicit height or `aspect-ratio`.

**Debug tip:** Open Chrome DevTools → Lighthouse tab → run a Performance audit. The CLS score will highlight images missing `width`/`height` attributes or explicit `aspect-ratio`.

**Next:** Responsive layouts with CSS Grid and Flexbox — using `auto-fit`, `minmax()`, and fluid techniques that respond without media queries.

## Challenge: responsive_image

Make an image container responsive with a fixed aspect ratio.

1. `.img-box` — `width: 100%`, `aspect-ratio: 16 / 9`, `overflow: hidden`
2. `.img-fill` — `width: 100%`, `height: 100%`, `object-fit: cover`

```html
<div class="img-box">
  <div class="img-fill" id="img-element" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); display:flex; align-items:center; justify-content:center; color:white; font-family:system-ui; font-weight:700;">16:9 Image</div>
</div>
```

```challenge
body { background: #0f172a; padding: 20px; }

.img-box {
  border-radius: 10px;
  overflow: hidden;
  /* add width and aspect-ratio */
}

.img-fill {
  /* add width, height, object-fit */
}
```

```test
var box  = getComputedStyle(document.querySelector('.img-box'))
var fill = getComputedStyle(document.querySelector('.img-fill'))
assert box.width !== '0px'
assert box.aspectRatio === '16 / 9' || box.aspectRatio === '16/9'
assert box.overflow === 'hidden'
assert fill.width !== '0px'
assert fill.height !== '0px'
```
