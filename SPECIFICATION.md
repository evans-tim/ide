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

**Theming**
- Single source of truth: Cursor theme tokens are owned by the root and propagated to every pane.
- Each pane owns its own visual styling using theme tokens; the root does not style pane interiors.

**Virtual file system**
- Flat set of text files, no directories.
- Owned by the root; panes never access it directly.

**Inter-pane communication**
- All messages route through the root; panes never address each other directly.
- Panes request the file list and request to open a file; the root responds and broadcasts open events to other panes.

**File browsing**
- Left pane lists every file in the VFS.
- Clicking a file selects it (highlighted with the relevant Cursor list-selection style, distinguishing focused vs. unfocused) and opens it.
- Opening a file displays its contents in the canvas pane.


# Canvas
**Canvas**
- Center pane; renders the contents of the currently opened file.
- Gutter on the left displays line numbers, one per content line, right-aligned.

**Canvas editing**
- Click positions the caret at the nearest character boundary on the clicked line; clicking past end-of-line places caret at line end.
- Clicking anywhere in the editable canvas area below the last line places the caret at the end of the last line.
- Text cursor (I-beam) over the entire editable canvas area to the right of the gutter, including padding above the first line, below the last line, and to the right of text; default cursor over the gutter.
- Typing inserts characters at the caret.
- Return splits the current line at the caret.
- Backspace deletes the character before the caret; at column 0, merges the current line into the previous line with the caret at the join point.
- Arrow keys move the caret; horizontal motion wraps across line boundaries, vertical motion clamps column to line length.
- No selection or highlight.
- The caret's line is highlighted using the same Cursor list-selection style as the file list, distinguishing focused vs. unfocused canvas.
- Edits are in-memory only; not persisted to the VFS.

**Gutter sizing**
- Reserves width for 3 digits by default; grows only when line count requires more digits.
