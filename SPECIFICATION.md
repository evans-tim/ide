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
- Dragging across text selects a contiguous range between the drag start and current pointer position.
- Cmd+A selects all canvas text.
- Selection may start or end beyond the visible text on a line; horizontal positions past end-of-line resolve to that line's end.
- Selection may continue while the pointer is outside the canvas pane or outside the containing iframe; the selected endpoint continues to track the pointer's logical text position until mouse release.
- Clicking without dragging clears the selection and places the caret at the clicked position.
- Typing while text is selected replaces the selection with the typed character and places the caret after the inserted character.
- Return while text is selected replaces the selection with a line break and places the caret at the start of the new line.
- Backspace/Delete while text is selected removes the selection and places the caret at the start of the removed range.
- Arrow keys without Shift clear any selection; Left/Right collapse to the start/end of the selection, and Up/Down move from the current caret endpoint.
- Shift+Arrow extends or shrinks the selection from its original anchor.
- Text selection highlight height matches the caret-line row highlight height.
- When there is no selection, the caret's line is highlighted using the same Cursor list-selection style as the file list, distinguishing focused vs. unfocused canvas.
- When there is no selection, the caret-line highlight is continuous from the start of the editable area to the canvas's right edge, including through the vertical scroll gutter.
- Edits are in-memory only; not persisted to the VFS.

**Gutter sizing**
- Reserves width for 3 digits by default; grows only when line count requires more digits.

**Scrollbar**
- Vertical scrollbar space is always reserved; appearance of the scrollbar causes no layout shift.
- Scrollbar gutter background matches the canvas background.
- Scrollbar thumb has square corners and fills the full width of the gutter.
- Scrolling has no momentum; motion stops as soon as scroll input stops.
- No horizontal scroll.

**Scroll past end**
- The canvas can always be scrolled until the last line is precisely flush with the top edge of the canvas viewport, regardless of file length.
- Even a single-line file is scrollable due to small padding above first line. 
- Alignment is exact: zero subpixel offset between the top of the last line and the viewport's top edge at maximum scroll.

**Scroll affordance**
- When the canvas is not scrolled to the very top, a subtle shadow appears along the top border spanning the full canvas width.
- The shadow is absent at scroll position zero.
