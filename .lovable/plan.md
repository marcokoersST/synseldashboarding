

## Fix All 38 City Coordinates Using Verified Projection

### Problem
Despite the comment in the code stating the projection formula, the actual coordinate values do not match the formula output. Many cities are significantly mispositioned:

- **Eastern cities off by ~30px east**: Groningen (537 vs correct 508), Enschede (587 vs 560), Emmen (590 vs 561), Assen (538 vs 507), Hoogeveen (525 vs 494)
- **Northern cities off by ~25px south**: Groningen (y:114 vs 88), Leeuwarden (y:122 vs 93)
- **Central cities off by 8-16px**: Utrecht, Eindhoven, Tilburg, Arnhem, Nijmegen, Apeldoorn, Amersfoort, Hilversum, Lelystad, and others

### Root Cause
The coordinates were estimated/guessed rather than computed from the projection formula. Only Amsterdam and Rotterdam happen to be close to correct.

### Solution
Recalculate every city using real geographic coordinates and the exact projection:

```
svgX = (longitude - 3.3594) / 3.8681 * 612.54
svgY = (53.5604 - latitude) / 2.8095 * 723.62
```

### All 38 Corrected Coordinates

| City | Current x,y | Correct x,y |
|------|-------------|-------------|
| Amsterdam | 248, 306 | 245, 307 |
| Rotterdam | 177, 421 | 177, 422 |
| Den Haag | 147, 391 | 149, 384 |
| Utrecht | 295, 383 | 279, 379 |
| Eindhoven | 349, 553 | 334, 546 |
| Groningen | 537, 114 | 508, 88 |
| Tilburg | 291, 519 | 274, 516 |
| Almere | 310, 304 | 302, 312 |
| Breda | 216, 509 | 223, 512 |
| Nijmegen | 401, 458 | 392, 450 |
| Arnhem | 410, 413 | 402, 406 |
| Enschede | 587, 359 | 560, 345 |
| Haarlem | 196, 298 | 204, 302 |
| Amersfoort | 330, 351 | 321, 362 |
| Apeldoorn | 427, 341 | 413, 348 |
| Zwolle | 441, 275 | 431, 269 |
| Den Bosch | 318, 479 | 308, 480 |
| Leiden | 180, 351 | 180, 361 |
| Maastricht | 378, 706 | 369, 698 |
| Dordrecht | 201, 470 | 211, 450 |
| Leeuwarden | 395, 122 | 386, 93 |
| Deventer | 453, 335 | 443, 333 |
| Venlo | 454, 573 | 445, 564 |
| Helmond | 374, 543 | 364, 535 |
| Roosendaal | 176, 525 | 175, 523 |
| Oss | 354, 468 | 342, 462 |
| Heerlen | 424, 696 | 415, 688 |
| Hilversum | 302, 340 | 288, 343 |
| Delft | 151, 404 | 158, 399 |
| Alkmaar | 214, 224 | 221, 239 |
| Emmen | 590, 189 | 561, 201 |
| Gouda | 206, 404 | 214, 399 |
| Zaandam | 233, 281 | 233, 289 |
| Lelystad | 349, 273 | 335, 268 |
| Middelburg | 31, 529 | 40, 531 |
| Vlissingen | 29, 551 | 34, 545 |
| Assen | 538, 153 | 507, 146 |
| Hoogeveen | 525, 205 | 494, 215 |

### File Changed
**`src/data/heatmapData.ts`** -- Replace the cities array (lines 45-84) with corrected coordinate values.

### No Other Changes
All animation, tooltip, filter, sidebar, and styling logic remains unchanged.

