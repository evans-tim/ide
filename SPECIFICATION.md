**Layout**
- Center pane: red.
- Left + right sidebars: full-height; x-precedence over bottom bar.
- Bottom bar: spans center column only (under center pane).

**Dividers**
- 1px visible between panes.
- ±2px invisible hit area around each divider.
- Drag-to-resize each region.
- Mousedown captures cursor-to-divider offset; drag applies offset so divider tracks cursor without snapping when grab originates anywhere within hit area.
- Resize cursor pinned during drag until mouseup.

**Overflow**
- Structurally impossible; viewport is hard ceiling (not merely hidden).

**Divider hover affordance**
- Fade-in: 0.1s ease-in, 0.2s delay.
- Fade-out: 0.15s ease-out, no delay.
