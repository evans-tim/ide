**Layout**
- Center pane: red.
- Left + right sidebars: full-height; x-precedence over bottom bar.
- Bottom bar: spans center column only (under center pane).

**Dividers**
- 2px visible between panes.
- ±2px invisible hit area around each divider.
- Drag-to-resize each region.
- Mousedown captures cursor-to-divider offset; drag applies offset so divider tracks cursor without snapping when grab originates anywhere within hit area.
- Resize cursor pinned during drag until mouseup.

**Overflow**
- Structurally impossible; viewport is hard ceiling (not merely hidden).

**Center pane embedding**
- Center pane content loaded via iframe (`canvas.html`).
- Iframe wrapped in `overflow: hidden` grid cell; iframe absolutely fills wrapper to prevent subpixel gaps at borders.
- Iframe `pointer-events: none` while a divider drag is active so parent receives `mousemove`/`mouseup` across the iframe.

**Divider hover affordance**
- Fade-in: 0.1s ease-in, 0.2s delay.
- Fade-out: 0.15s ease-out, no delay.
