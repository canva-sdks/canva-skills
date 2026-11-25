# Flyer formats

**Last verified:** 2026-11-25  
**Review cadence:** Every 180 days, or when the `create-design` or `resize-design` schema changes.  
**Source of truth:** ISO 216 and ANSI paper sizes for physical dimensions; the live `create-design` and `resize-design` tool descriptions for how a size is requested.

## Choosing a size

| The user says | Use |
|---|---|
| Names a size | That size |
| Nothing, and the region uses ISO paper | A4 portrait |
| Nothing, and the flyer is for the United States or Canada | US Letter portrait |
| "Small flyer", "handout", "leaflet to drop in letterboxes" | A5, or Half Letter in the United States or Canada |
| "Rack card", "DL", "fits in an envelope" | DL |
| Screen only (email, chat, website) | A4 or US Letter portrait, unless they name a pixel size |

## Requesting a size at generation

Observed with `create-design` on 2026-11-25. Re-test when the tool changes.

| Format passed | Result |
|---|---|
| `Flyer (Portrait A4)` | 794 × 1123, as requested |
| `Flyer (Landscape A4)` | 1123 × 794, as requested |
| `Flyer (Portrait 5.5 × 8.5 in)` | Not resolved; came back as A4 portrait |

For any size not confirmed here, generate, check the page dimensions, and resize if they are wrong. A resize from A4 to Half Letter left the call-to-action banner covering the address, so always re-verify after resizing.

## Paper sizes

Portrait dimensions; swap width and height for landscape. Pixel values are the physical size at 96 pixels per inch, which is how Canva reports an A4 page, and are for a custom canvas in `resize-design`, which takes width and height in pixels.

| Size | Millimetres | Inches | Pixels (96 per inch) |
|---|---:|---:|---:|
| A4 | 210 × 297 | 8.27 × 11.69 | 794 × 1123 |
| A5 | 148 × 210 | 5.83 × 8.27 | 559 × 794 |
| A6 | 105 × 148 | 4.13 × 5.83 | 397 × 559 |
| DL | 99 × 210 | 3.90 × 8.27 | 374 × 794 |
| US Letter | 216 × 279 | 8.5 × 11 | 816 × 1056 |
| Half Letter | 140 × 216 | 5.5 × 8.5 | 528 × 816 |

## Print hand-off notes

- **Safe margin.** Keep text and logos at least 5 mm (about 0.2 in) inside every edge. Trimming is not exact.
- **Bleed.** A background or photo meant to run to the edge needs to extend past it, typically 3 mm (0.125 in). Bleed and crop marks are set in the Canva editor's download options; list them as a manual step when the user is sending the file to a print shop.
- **File type.** PDF for print. PNG or JPG for screen.
- **Home or office printers** leave a white border on every edge. Tell the user when the design has an edge-to-edge background.
- **Proof.** Recommend one printed copy before a full run, to check type size and colour on paper.
