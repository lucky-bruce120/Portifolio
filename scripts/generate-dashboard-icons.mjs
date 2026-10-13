// Generates the dashboard's PWA app icons as real PNGs.
//
// Written as a dependency-free script so the icons are reproducible and no
// image library is pulled into the project just to draw a monogram.
//
//   node scripts/generate-dashboard-icons.mjs

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'dashboard', 'icons')

// Matches the dashboard palette: --primary and --accent from style.css.
const GRADIENT_FROM = [0x63, 0x66, 0xf1]
const GRADIENT_TO = [0xa8, 0x55, 0xf7]
const GLYPH = [0xff, 0xff, 0xff]

// ---------------------------------------------------------------------------
// PNG encoding
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buffer) {
  let c = -1
  for (let i = 0; i < buffer.length; i++) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  ihdr[10] = 0 // deflate
  ihdr[11] = 0 // adaptive filtering
  ihdr[12] = 0 // no interlace

  // Each scanline is prefixed with its filter type (0 = None).
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}

// ---------------------------------------------------------------------------
// Rasterising
// ---------------------------------------------------------------------------

// Membership test for a rounded rectangle, in normalised 0..1 coordinates.
function inRoundRect(px, py, x0, y0, x1, y1, radius) {
  if (px < x0 || px > x1 || py < y0 || py > y1) return false
  const r = Math.min(radius, (x1 - x0) / 2, (y1 - y0) / 2)
  const cx = px < x0 + r ? x0 + r : px > x1 - r ? x1 - r : px
  const cy = py < y0 + r ? y0 + r : py > y1 - r ? y1 - r : py
  const dx = px - cx
  const dy = py - cy
  return dx * dx + dy * dy <= r * r
}

const lerp = (a, b, t) => a + (b - a) * t

// A "B": a solid rounded block with two counters punched out of it. Building it
// this way rather than from overlapping bars avoids the notches that appear on
// the right edge where the shapes meet.
function inGlyphB(px, py, gx, gy, gw, gh) {
  const t = gh * 0.17 // stroke thickness
  const mid = gy + gh / 2
  const right = gx + gw
  const bottom = gy + gh

  if (!inRoundRect(px, py, gx, gy, right, bottom, t * 0.55)) return false

  const upper = inRoundRect(px, py, gx + t, gy + t, right - t, mid - t * 0.5, t * 0.35)
  const lower = inRoundRect(px, py, gx + t, mid + t * 0.5, right - t, bottom - t, t * 0.35)
  if (upper || lower) return false

  return true
}

// An "L": left stem and bottom bar.
function inGlyphL(px, py, gx, gy, gw, gh) {
  const t = gh * 0.17
  const r = t / 2
  const right = gx + gw
  const bottom = gy + gh

  return (
    inRoundRect(px, py, gx, gy, gx + t, bottom, r) ||
    inRoundRect(px, py, gx, bottom - t, right, bottom, r)
  )
}

function inGlyph(px, py) {
  const totalW = 0.62
  const totalH = 0.40
  const gx = (1 - totalW) / 2
  const gy = (1 - totalH) / 2 + 0.01

  const gap = totalW * 0.13
  const letterW = (totalW - gap) / 2

  return (
    inGlyphB(px, py, gx, gy, letterW, totalH) ||
    inGlyphL(px, py, gx + letterW + gap, gy, letterW, totalH)
  )
}

/**
 * Renders one icon.
 * `bleed` true draws a full-bleed square for maskable icons, where the
 * launcher applies its own mask and crops to a safe zone.
 */
function renderIcon(size, { bleed = false, glyphScale = 1 } = {}) {
  const rgba = Buffer.alloc(size * size * 4)
  const SS = 4 // supersampling factor, averaged down for antialiasing
  const radius = bleed ? 0.5 : 0.22

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0

      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS) / size
          const py = (y + (sy + 0.5) / SS) / size

          if (!inRoundRect(px, py, 0, 0, 1, 1, radius)) continue

          const t = (px + py) / 2
          let cr = lerp(GRADIENT_FROM[0], GRADIENT_TO[0], t)
          let cg = lerp(GRADIENT_FROM[1], GRADIENT_TO[1], t)
          let cb = lerp(GRADIENT_FROM[2], GRADIENT_TO[2], t)

          if (inGlyph((px - 0.5) / glyphScale + 0.5, (py - 0.5) / glyphScale + 0.5)) {
            cr = GLYPH[0]
            cg = GLYPH[1]
            cb = GLYPH[2]
          }

          r += cr
          g += cg
          b += cb
          a += 255
        }
      }

      const samples = SS * SS
      const i = (y * size + x) * 4
      // Premultiplied average so transparent edges do not bleed dark.
      const alpha = a / samples
      const coverage = alpha / 255
      rgba[i] = coverage ? Math.round(r / (samples * coverage)) : 0
      rgba[i + 1] = coverage ? Math.round(g / (samples * coverage)) : 0
      rgba[i + 2] = coverage ? Math.round(b / (samples * coverage)) : 0
      rgba[i + 3] = Math.round(alpha)
    }
  }

  return encodePng(size, size, rgba)
}

// ---------------------------------------------------------------------------

fs.mkdirSync(OUT_DIR, { recursive: true })

const icons = [
  { file: 'icon-192.png', size: 192, options: { bleed: false } },
  { file: 'icon-512.png', size: 512, options: { bleed: false } },
  // Maskable icons get a smaller glyph: Android crops the outer ~20%.
  { file: 'icon-maskable-192.png', size: 192, options: { bleed: true, glyphScale: 0.62 } },
  { file: 'icon-maskable-512.png', size: 512, options: { bleed: true, glyphScale: 0.62 } }
]

for (const { file, size, options } of icons) {
  const png = renderIcon(size, options)
  fs.writeFileSync(path.join(OUT_DIR, file), png)
  console.log(`  ${file.padEnd(26)} ${size}x${size}  ${(png.length / 1024).toFixed(1)} kB`)
}

console.log(`\nWrote ${icons.length} icons to public/dashboard/icons/`)