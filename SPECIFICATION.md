**Layout**
- Top bar and bottom status bar span full viewport width.
- Left + right sidebars: span between top and status bars; x-precedence over bottom panel.
- Bottom panel: spans center column only (under center pane).

**Keyboard panel toggles**
- Cmd+I toggles the right panel open/closed.
- Cmd+B toggles the left panel open/closed.
- Ctrl+` toggles the bottom panel open/closed.

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

**Fonts**
- Canvas text and line numbers use the editor monospace font stack: `Menlo, Monaco, "Courier New", monospace`.
- All non-canvas UI uses the workbench/interface font stack: `-apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", sans-serif`.
- Default font size is 13px.
- Font choices are propagated as root-owned tokens so panes can apply the correct stack locally.

**Virtual file system**
- Flat set of text files, no directories.
- Owned by the root; panes never access it directly.

**Inter-pane communication**
- All messages route through the root; panes never address each other directly.
- Panes request the file list and request to open a file; the root responds and broadcasts open events to other panes.


# File Tree
**File browsing**
- The left pane lists every file in the VFS as a file tree.
- Directories are inferred from slash-delimited file paths; the VFS remains a flat set of text files.
- A file row displays the file name.
- Clicking a file row selects and opens the file.
- Opening a file displays its contents in the canvas pane.
- The selected file row uses the relevant Cursor list-selection style, including a slightly darker 1px top and bottom border, and distinguishes focused vs. unfocused states.
- Hovering a file row uses the relevant Cursor list-selection style without top and bottom border.
- A directory row displays a caret icon followed by the directory name.
- Clicking a directory row toggles it between collapsed and expanded.
- An expanded directory row uses a downward caret.
- A collapsed directory row uses a right-facing caret.
- An expanded directory shows its direct child file rows and directory rows.
- Each directory's expanded/collapsed state is stored in memory; directories are collapsed by default until expanded.
- An expanded directory has a 1px vertical indent guide alongside its child rows.
- Each indent guide aligns horizontally with the left edge of its parent directory row's caret.
- When the mouse is inside the left pane, indent guides are visible for all expanded directories.
- When the mouse is outside the left pane, only indent guides for directories containing the selected file are visible.
- Indent guides for directories containing the selected file are slightly darker than hover-only indent guides.





# Right Panel
**Prompt composer**
- Right pane contains a prompt composer with an editable text input area at the top. 
- The editable text input area sits above the non-editable bottom affordance area.
- The text input scroll area ends above the bottom affordance; the text cursor does not appear over the affordance area.
- Send control sits in the bottom-right corner of the composer affordance area.
- Hovering the send control uses pointer cursor and a subtly lighter control background.
- Clicking the send control toggles between send and stop states.
- Send state displays an upward arrow icon.
- Stop state displays a rounded stop icon.
- Shift+Enter inserts a newline in the editable text input area.
- Enter submits the chat.
- Clicking the upward arrow send control submits the chat.


**Submission**
- Submitting the chat clears the composer text and places the full composer, including its text area and bottom affordance area, at the bottom of the right panel.
- After submission, the composer is in stop state and displays the rounded stop icon until the response is complete. 
- Submitted user messages display at the top as plain message panels with a minimalist border.
- Submitted user message panels contain only the submitted text by default; no per-message action buttons are visible.
- While a submitted user message panel is hovered, a rounded stop control appears inside the panel on the right-hand side for as long as the response is not complete. 
- Immediately after chat submission, `Planning next moves` displays beneath the submitted user message panel.
- After 1000ms, `Planning next moves` is replaced with `Hello.` and the response is complete. 


# Canvas
**Canvas**
- Center pane; renders the contents of the currently opened file.
- Renders editable text contents.
- Gutter on the left displays line numbers, one per content line, right-aligned.
- `editor.wordSeparators` defines the characters that delimit words.

**Canvas editing**
- Normal click positions the caret by splitting each hit character at its horizontal midpoint: clicking the left half places the caret before that character, clicking the right half places it after that character, and clicking past end-of-line places caret at line end.
- Clicking anywhere in the editable canvas area below the last line places the caret at the end of the last line.
- Text cursor (I-beam) over the entire editable canvas area to the right of the gutter, including padding above the first line, below the last line, and to the right of text; default cursor over the gutter.
- Typing inserts characters at the caret.
- Return splits the current line at the caret.
- Backspace deletes the character before the caret; at column 0, merges the current line into the previous line with the caret at the join point.
- Arrow keys move the caret; horizontal motion wraps across line boundaries, vertical motion clamps column to line length.
- Dragging across text selects a contiguous range between the drag start and current pointer position.
- Cmd+A selects all canvas text.
- Cmd+C copies the selected canvas text to the system clipboard.
- Cmd+V replaces the selection with clipboard text, or inserts clipboard text at the caret when there is no selection.
- Selection may start or end beyond the visible text on a line; horizontal positions past end-of-line resolve to that line's end.
- Selection may continue while the pointer is outside the canvas pane or outside the containing iframe; the selected endpoint continues to track the pointer's logical text position until mouse release.
- Clicking without dragging clears the selection and places the caret at the clicked position.
- Double-clicking a word selects the whole word using `editor.wordSeparators`, replacing any existing selection.
- If the pointer remains down after the second click, dragging enters word selection mode with the initially selected word as the fixed root.
- In word selection mode, the moving selection caret endpoint snaps by hovered word: to the beginning of the hovered word when the hover position is left/upward of the root, and to the end of the hovered word when the hover position is right/downward of the root.
- For the root word itself, word selection mode snaps the caret endpoint to the end of the word.
- Each delimiter character defined by `editor.wordSeparators` counts as its own word for word selection mode.
- Typing while text is selected replaces the selection with the typed character and places the caret after the inserted character.
- Return while text is selected replaces the selection with a line break and places the caret at the start of the new line.
- Backspace/Delete while text is selected removes the selection and places the caret at the start of the removed range.
- Arrow keys without Shift clear any selection; Left/Right collapse to the start/end of the selection, and Up/Down move from the current caret endpoint.
- Shift+Arrow extends or shrinks the selection from its original anchor.
- Text selection highlight height matches the caret-line row highlight height.
- Text selection highlights have super subtle rounding on the selected shape's visible perimeter.
- (NOT IMPLEMENTED) Convex outer corners are rounded where the selected shape begins or ends horizontally or vertically.
- (NOT IMPLEMENTED) Concave inner corners are rounded where adjacent selected rows have different horizontal extents, using the visual complement of a rounded rectangle so the stepped selection outline curves inward rather than forming a square notch.
- (NOT IMPLEMENTED) Inner corner rounding applies at every selected-row transition where one row starts farther right, starts farther left, ends earlier, or ends later than its adjacent selected row.
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
