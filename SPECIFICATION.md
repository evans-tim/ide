**Layout**
- Top bar and bottom status bar span full viewport width.
- Left + right sidebars: span between top and status bars; x-precedence over bottom panel.
- Bottom panel: spans center column only (under center pane).

**Dividers**
- 2px visible between panes.
- ±1px invisible hit area around each divider.
- Drag-to-resize each region.
- Mousedown captures cursor-to-divider offset; drag applies offset so divider tracks cursor without snapping when grab originates anywhere within hit area.
- Resize cursor pinned during drag until mouseup.

**Overflow**
- Structurally impossible; viewport is hard ceiling (not merely hidden).

**Pane embedding**
- Each pane is an independently-loaded document.
- Pane content is clipped to its region; pane fills its region edge-to-edge with no subpixel gaps at borders.
- Panes do not intercept pointer events while a divider drag is active.

**Divider hover affordance**
- Fade-in: 0.1s ease-in, 0.2s delay.
- Fade-out: 0.15s ease-out, no delay.
