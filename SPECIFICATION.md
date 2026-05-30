**Layout**
- Top bar and bottom status bar span full viewport width.
- Main top bar height is 32px.
- Main top bar contains a `settings-gear.svg` control at the righthandmost side.
- Clicking the main top bar settings control opens the Settings canvas tab.
- If the Settings canvas tab is already open and inactive, clicking the settings control makes it the active canvas tab.
- If the Settings canvas tab is already the active canvas tab, clicking the settings control is a no-op.
- Left + right sidebars: span between top and status bars; x-precedence over bottom panel.
- The left panel defaults to 15% of the viewport width.
- The right panel defaults to 20% of the viewport width.
- Bottom panel: spans center column only (under center pane).
- The main bottom status bar does not display the Settings theme dropdown value.

**Keyboard panel toggles**
- Cmd+I opens the right panel when it is closed.
- If the right panel is closed and at least one agent tab exists, Cmd+I restores the right panel with the last active tab selected.
- If the right panel is closed and no agent tabs exist, Cmd+I creates a new fresh agent tab and opens the right panel with that tab selected.
- If the right panel is open, Cmd+I closes the right panel without deleting any existing agent tabs.
- Cmd+B toggles the left panel open/closed.
- Ctrl+` toggles the bottom panel open/closed.

**Dividers**
- 2px visible between panes.
- Divider color is derived from theme tokens and remains visible in both light and dark themes.
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
- Hovering or dragging a divider displays a theme-token accent highlight that remains visible in both light and dark themes.
- Fade-in: 0.1s ease-in, 0.2s delay.
- Fade-out: 0.15s ease-out, no delay.

**Theming**
- Single source of truth: Cursor theme tokens are owned by the root and propagated to every pane.
- The root owns the active theme setting.
- The active theme setting is selected from exactly two values: `light` and `dark`.
- When the active theme is `light`, root-owned theme tokens are loaded from `cursor-light-theme.json`.
- When the active theme is `dark`, root-owned theme tokens are loaded from `cursor-dark-midnight-theme.json`.
- Theme token changes propagate to every iframe-backed pane, including the file tree, canvas, Settings page, right panel, and any bottom panel documents.
- Each pane owns its own visual styling using theme tokens; the root does not style pane interiors.
- Monochrome UI icons render as masks over `currentColor`, so icon color follows the active theme and parent control state.

**Fonts**
- Canvas text and line numbers use the editor monospace font stack: `Menlo, Monaco, "Courier New", monospace`.
- All non-canvas UI uses the workbench/interface font stack: `-apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", sans-serif`.
- Default font size is 13px.
- Font choices are propagated as root-owned tokens so panes can apply the correct stack locally.

**General purpose button**
- A general purpose button displays unstyled text inside its border.
- A general purpose button has a 1px light gray border and subtly rounded corners.
- A general purpose button's border wraps its text with 2px of vertical padding and 4px of horizontal padding.
- Hovering a general purpose button makes its border slightly darker and uses the pointer cursor.
- Focusing a general purpose button makes its border thicker while preserving the same border darkness used by hover.
- A general purpose button reserves enough space for its focused border so focusing the button causes no layout shift.

**Dropdown**
- A dropdown trigger behaves like a general purpose button with fixed 150px width.
- A dropdown trigger displays its selected text left-aligned and `chevron-up-down.svg` right-aligned.
- Dropdown trigger text that exceeds the available text area is truncated with an ellipsis.
- Clicking a dropdown trigger focuses it and displays the focused border without changing the trigger's layout box.
- A dropdown trigger's default, hover, and focus outlines use low-contrast theme-appropriate gray colors; hover and focus are only slightly lighter than the default outline.
- Opening or closing a dropdown causes no layout shift.
- Clicking a focused dropdown trigger opens a popup below it.
- The dropdown popup is a rounded-corner div with 200px width and a 1px outline/border.
- The dropdown popup background and border follow the active theme's dropdown colors.
- The dropdown popup's right edge aligns with the dropdown trigger's right edge.
- The dropdown popup sits 4px below the dropdown trigger.
- The dropdown popup lists every selectable item for the dropdown.
- Each dropdown option displays its text with overflow truncated by an ellipsis.
- Each dropdown option uses the active theme's deemphasized list text color by default and hover list text color on hover.
- Each dropdown option uses 2px vertical padding and 4px horizontal padding.
- Dropdown options have no borders.
- Hovering any dropdown option uses the pointer cursor.
- Clicking outside the open dropdown popup closes the popup and removes focus from the dropdown trigger.
- Clicking a dropdown option changes the dropdown trigger text to that option and closes the popup.

**Virtual file system**
- The root owns the mounted workspace directory.
- By default, the mounted workspace directory is the current working directory where the server process was started.
- The VFS exposes files from the current mounted workspace directory.
- File paths are relative to the current mounted workspace directory.
- Panes never access the mounted workspace directory or VFS directly.
- Changing the mounted workspace directory replaces the active VFS contents with the files from the newly mounted directory.
- Changing the mounted workspace directory clears the current file-tree selection state.
- Changing the mounted workspace directory collapses every directory in the file tree.
- Changing the mounted workspace directory closes every open filename tab and leaves the canvas pane on a blank canvas.
- Changing the mounted workspace directory closes every open agent chat tab and leaves the right panel closed.
- (NOT IMPLEMENTED) File tabs should be saved and restored per mounted workspace directory.
- (NOT IMPLEMENTED) Agent chat tabs should be saved and restored per mounted workspace directory.

**Inter-pane communication**
- All messages route through the root; panes never address each other directly.
- Panes request the file list and request to open a file; the root responds and broadcasts open events to other panes.
- Settings theme changes route through the root before root-owned theme tokens change.
- Settings directory changes route through the root before the mounted workspace directory changes.

**Settings**
- The Settings page displays each setting as a rounded setting row.
- Each setting row background follows the active theme and appears as a light neutral gray in light mode.
- Each setting row's left side displays the setting title and subtitle.
- Each setting row title uses the strongest foreground text color for the active theme.
- Each setting row subtitle uses a slightly deemphasized foreground color for the active theme.
- The theme setting row's left side displays `Theme` as the title and `Select application color scheme` as the subtitle.
- The theme setting row's right side displays the theme dropdown trigger.
- The theme dropdown remains the control that changes the active application color scheme.
- The directory setting row's left side displays `Directory` as the title and `Select the directory for the current workspace` as the subtitle.
- The directory setting row's right side displays a directory button.
- The directory button behaves like a general purpose button.
- The directory button text is the current mounted workspace directory path.
- When the current mounted workspace directory path exceeds the directory button's available text area, the path is truncated on the left with an ellipsis so the end of the path remains visible.
- Clicking the directory button opens the browser's native directory picker.
- Choosing a directory from the native directory picker changes the mounted workspace directory to that directory.


# File Tree
**File browsing**
- The left pane lists every file in the VFS as a file tree.
- Directories are inferred from slash-delimited file paths relative to the current mounted workspace directory.
- A file row displays the file name.
- File-tree row label text that exceeds the available left-pane width is truncated with a trailing ellipsis, with truncation beginning exactly at the left pane's right border (no reserved right padding).
- A file row displays a file-type icon immediately to the left of the file name.
- File-type icons are glyphs from the Seti icon font (`seti.woff`); each glyph is selected by file extension using the mapping in `vs-seti-icon-theme.json`.
- A file-type icon glyph is rendered in the per-extension color defined by the active theme variant in `vs-seti-icon-theme.json` (the light-variant color in light theme, the dark-variant color in dark theme).
- File-type icons and directory caret icons render at the same square size.
- File rows and directory rows use the same icon-to-label spacing, so a caret + directory name pair occupies the same rhythm as a file icon + file name pair.
- The row icon begins very close to its indent guide, with about 5px horizontal margin between the guide and the icon's left edge.
- A file row's glyph is resolved in priority order: an exact file-name mapping, then the extension mapping, then the mapping for the VS Code language associated with the extension (e.g. `.js` resolves through the `javascript` language, `.html` through `html`, `.md` through `markdown`, `.txt` through `plaintext`); a file that matches none of these uses the Seti theme's default file glyph.
- Clicking a file row selects and opens the file.
- Opening a file displays its contents in the canvas pane.
- The selected file row uses the relevant Cursor list-selection style, and distinguishes focused vs. unfocused states.
- When a filename tab selects a file, every collapsed ancestor directory of that file expands before the selected file row is highlighted, so the highlighted row is visible in the file tree.
- When the left pane is focused, the selected file row additionally shows a slightly darker 1px top and bottom border; when the left pane is unfocused, the selection highlight remains but the borders are absent.
- Hovering a file row uses the relevant Cursor list-selection style without top and bottom border.
- A directory row displays a caret icon followed by the directory name.
- Clicking a directory row selects that directory row and toggles it between collapsed and expanded.
- The selected directory row uses the relevant Cursor list-selection style, and distinguishes focused vs. unfocused states.
- When the left pane is focused, the selected directory row additionally shows a slightly darker 1px top and bottom border; when the left pane is unfocused, the selection highlight remains but the borders are absent.
- When focus leaves the left pane because a non-row target receives focus, the selected directory row remains highlighted but loses its focused top and bottom borders.
- When focus leaves the left pane because another file tree row, filename tab, or canvas region selects a different file tree row, the prior selected directory row is no longer highlighted and the newly selected row receives the selection state.
- Clicking inside the left pane outside any file tree row clears the file tree selection state, so no file or directory row remains focused or highlighted, even when the previously selected row represents the currently opened file.
- An expanded directory row uses a downward caret.
- A collapsed directory row uses a right-facing caret.
- An expanded directory shows its direct child file rows and directory rows.
- Each directory's expanded/collapsed state is stored in memory; directories are collapsed by default until expanded.
- An expanded directory has a 1px vertical indent guide alongside its child rows.
- Each indent guide aligns horizontally with the left edge of its parent directory row's caret icon.
- Child row icons start just to the right of their parent indent guide, preserving the same approximately 5px guide-to-icon margin at every depth.
- When the mouse is inside the left pane, indent guides are visible for all expanded directories.
- When the mouse is outside the left pane, only indent guides for the single parent directory immediately containing the selected file are visible.
- Indent guides for directories containing the selected file are slightly darker than hover-only indent guides.





# Right Panel
**Text color**
- All right panel text uses the darkest available foreground color, except inactive tab titles and the `Planning next moves` placeholder.
- Inactive tab title text uses the inactive tab foreground color.
- The `Planning next moves` placeholder uses the inactive tab foreground color as its base and displays a subtle looping shimmer that repeats every 1s.

**Topbar**
- Right panel has a topbar equal in height to the main top bar.
- Right panel topbar height is 32px.
- The right panel topbar contains the `chat.svg` icon all the way to the left, followed by the text `New Agent`, followed by the `close.svg` icon.
- The right panel topbar contains the `add.svg` icon right-aligned.
- Hovering the add control shows a 20px by 20px rounded square background using a slightly darker gray, matching the list highlight color.
- Hovering the close control shows a 20px by 20px rounded square background using a slightly darker gray, matching the list highlight color.
- The `chat.svg` icon renders at 16px by 16px.
- The `close.svg` icon renders at 12px by 12px.
- The `add.svg` icon renders at 12px by 12px.

**Tabs**
- Each tab contains the `chat.svg` icon, its title text, and its adjacent `close.svg` icon.
- A tab's `close.svg` icon is hidden unless that tab is hovered or is the active tab; on inactive non-hovered tabs the close icon's space is preserved so revealing it causes no layout shift.
- Hovering an inactive tab gives it a slightly emphasized background relative to its default inactive tab background.
- While a tab has a submission running, its `chat.svg` icon is replaced by `spinner.svg`.
- The active tab background matches the main right panel background, not the right panel topbar background.
- The active tab has a 1px border on its left, right, and bottom edges; its bottom border matches the main right panel background so switching tabs causes no 1px layout shift.
- Inactive tab backgrounds match the right panel topbar background.
- Inactive tabs have a 1px border on their left, right, and bottom edges.
- Clicking the `add.svg` control creates a new agent tab at the end of the current tab list.
- The newly-created tab becomes the active tab immediately.
- The button group div containing the `add.svg` control has a left border separating it from the scrollable tab list.
- When the tab list grows until it reaches the button group border, the tab list scrolls horizontally instead of shrinking the button group.
- The tab list's horizontal scrollbar appears only while horizontal overflow exists and the mouse is inside the scrollable tab list area.
- The tab list's horizontal scrollbar is hidden when the mouse is inside the button group area or anywhere outside the scrollable tab list area.
- The tab list's horizontal scrollbar visibility changes animate over 0.2s instead of switching instantly.
- The tab list's horizontal scrollbar has no visible gutter; only the thumb is visible.
- The tab list's horizontal scrollbar thumb is flush with the bottom edge of the tab group.
- The tab list's horizontal scrollbar thumb is 3px tall with square edges.
- The tab list's horizontal scrollbar has a 4px mouse hit area.
- The tab list's horizontal scrollbar uses the same base color as the canvas scrollbar.
- Hovering the tab list's horizontal scrollbar thumb makes it slightly darker.
- Dragging the tab list's horizontal scrollbar thumb scrolls the tab list horizontally.
- Wheel scrolling the tab list has no momentum; motion stops as soon as scroll input stops.
- Each tab grows only as wide as needed for its title and controls, up to a maximum width of 200px.
- Tab title text that exceeds the available tab width is truncated with an ellipsis.
- Each tab owns its own conversation history and composer draft.
- Switching tabs displays the selected tab's conversation history.
- If the selected tab has no submitted messages, switching to it displays its current composer draft only.
- Composer draft text is preserved per tab when switching away from the tab.
- Composer draft text remains visible for the active tab whether the composer is in the top starting position or pinned to the bottom after a submission.
- Composer position is preserved per tab according to that tab's conversation state.
- Creating or switching tabs does not modify any other tab's conversation history or composer draft.
- Clicking a tab's `close.svg` icon closes that tab.
- Closing an inactive tab does not change the active tab.
- Closing the active tab selects the most recently active remaining tab.
- Closing the active tab when it is the last remaining tab closes the entire right panel and leaves no agent tabs.


- (NOT IMPLEMENTED) The `close.svg` icon beside `New Agent` should be visually centered against the lowercase character body of `New Agent`, not against the full text line box.
- (NOT IMPLEMENTED) The `close.svg` icon beside `New Agent` should target the vertical center of the lowercase glyph area, approximately the midpoint between the lowercase x-height top and baseline.
- (NOT IMPLEMENTED) The `close.svg` icon beside `New Agent` should not rely on aligning the SVG box center to the text line center, because the visible X glyph does not fill the SVG viewport.
- (NOT IMPLEMENTED) The `close.svg` icon beside `New Agent` should preserve the 20px by 20px hover background center while aligning the visible X glyph to the lowercase character center.

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
- Submitting the chat calls the active chat's title function.
- The active chat's title changes from `New Agent` to another string after its first submission.
- (NOT IMPLEMENTED) The active chat's title should be a summary of the submitted prompt: the submitted prompt is sent to an LLM for summarization, and the returned summary is saved as the chat title.
- The active chat's title is set to the submitted prompt text verbatim.
- After submission, the composer is in stop state and displays the rounded stop icon until the response is complete.
- Submitted user messages display above the composer as plain message panels with a minimalist border, in chronological order (oldest at top, newest directly above the composer).
- Submitted user message panels contain only the submitted text by default; no per-message action buttons are visible.
- Submitted user message panels have the same maximum height as an in-place prompt composer.
- A submitted user message panel at maximum height and its corresponding in-place prompt composer at maximum height occupy the same total panel height, so focusing the message panel causes no layout shift.
- Submitted user message panels do not scroll internally; text that exceeds the maximum height visually fades out at the bottom with a subtle shadow/fade affordance.
- Hovering a submitted user message panel darkens its border and uses the pointer cursor.
- Clicking a submitted user message panel converts that panel in place into a prompt composer panel containing the submitted text.
- When a submitted user message panel converts into an in-place prompt composer, focus enters the composer with the text cursor at the end of the prompt.
- The in-place prompt composer's text area height is the smallest height that fits the submitted text, up to the normal prompt composer's maximum text area height.
- If the submitted text exceeds that maximum height, the in-place prompt composer uses the same vertical scrolling behavior as the normal prompt composer.
- When focus leaves the in-place prompt composer without submitting, it converts back into a submitted user message panel.
- Clicking a different submitted user message panel while an in-place prompt composer is active closes the active in-place composer and opens the clicked message panel as an in-place prompt composer in the same click.
- The bottom prompt composer remains visible while a submitted user message is being edited in place.
- Submitting from an in-place prompt composer replaces that user message with the submitted text, submits the conversation from that point, and removes every later message and response from the conversation history.
- While a submitted user message panel is hovered, a rounded stop control appears inside the panel on the right-hand side for as long as the response to that message is not complete.
- Immediately after chat submission, `Planning next moves` displays beneath the just-submitted user message panel with 12px of margin above it.
- After 500ms, `Planning next moves` is replaced by the default response stream.
- The default response is `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
- Response tokens are delimited by spaces only.
- The default response streams one token every 50ms until all tokens have displayed, then the response is complete.
- Subsequent submissions append a new user message panel beneath the previous response, followed by its own streamed default response; prior messages and responses remain visible above.
- The conversation area scrolls vertically when its content exceeds the available height; the composer remains pinned to the bottom of the right panel.

**Right panel spacing**
- 12px padding between the right panel edges and the conversation/composer content on all sides.
- 12px vertical gap between consecutive conversation items (user message panel, response text, composer).
- The right-edge padding reserves space for the conversation scrollbar gutter: the scrollbar appears within that reserved margin, leaving the composer and message panels' right edges fixed in place whether or not the scrollbar is visible.
- The left-edge padding and the right-edge padding (inclusive of reserved scrollbar gutter) are equal, so the composer and message panels remain horizontally centered within the right panel regardless of scrollbar visibility.

**Conversation scrollbar**
- The conversation scrollbar gutter spans the full 12px right margin between the message/composer content and the right panel edge.
- The scrollbar thumb is centered horizontally within the gutter, with equal small insets on its left and right so its width is narrower than the gutter (standard scrollbar thickness).
- The scrollbar thumb has fully rounded top and bottom ends.
- The scrollbar track is transparent.

**Composer scrollbar**
- The composer text input area scrolls vertically when its content exceeds the available height.
- The composer scrollbar gutter is reserved within the composer's right edge; its appearance causes no layout shift and the text input's right edge remains fixed whether or not the scrollbar is visible.
- The scrollbar thumb is centered horizontally within the gutter, with equal small insets on its left and right so its width is narrower than the gutter (standard scrollbar thickness).
- The scrollbar thumb has fully rounded top and bottom ends.
- The scrollbar track is transparent.


# Canvas
**Canvas topbar**
- Canvas has a topbar equal in height to the main top bar.
- Canvas topbar height is 32px.
- Canvas topbar background matches the main top bar background.
- Canvas topbar contains a scrollable filename tab list on the left and a right-aligned placeholder button group on the right.
- The placeholder button group has a left border separating it from the scrollable filename tab list.
- The placeholder button group does not shrink when the filename tab list overflows.
- Placeholder buttons do not perform any file action until their behavior is separately specified.
- When the filename tab list grows until it reaches the placeholder button group border, the filename tab list scrolls horizontally instead of shrinking the placeholder button group.
- The filename tab list's horizontal scrollbar appears only while horizontal overflow exists and the mouse is inside the scrollable filename tab list area.
- The filename tab list's horizontal scrollbar is hidden when the mouse is inside the placeholder button group area or anywhere outside the scrollable filename tab list area.
- The filename tab list's horizontal scrollbar visibility changes animate over 0.2s instead of switching instantly.
- The filename tab list's horizontal scrollbar has no visible gutter; only the thumb is visible.
- The filename tab list's horizontal scrollbar thumb is flush with the bottom edge of the tab group.
- The filename tab list's horizontal scrollbar thumb is 3px tall with square edges.
- The filename tab list's horizontal scrollbar has a 4px mouse hit area.
- The filename tab list's horizontal scrollbar uses the same base color as the canvas scrollbar.
- Hovering the filename tab list's horizontal scrollbar thumb makes it slightly darker.
- Dragging the filename tab list's horizontal scrollbar thumb scrolls the filename tab list horizontally.
- Wheel scrolling the filename tab list has no momentum; motion stops as soon as scroll input stops.

**Canvas file breadcrumb bar**
- Below the canvas topbar, the canvas has a file breadcrumb bar equal in height to the canvas topbar (32px).
- The breadcrumb bar's left side displays the currently loaded file's path as a breadcrumb trail.
- The breadcrumb trail lists every parent directory name of the current file, separated by `chevron-right.svg`, followed by the current file's file-type icon and then the file name.
- The current file's file-type icon in the breadcrumb is resolved and rendered identically to a filename tab's file-type icon (same Seti glyph priority order, same square size, same per-extension active-theme variant color).
- When the loaded file is a Markdown (`.md`) file, the breadcrumb bar's right side displays a `Preview` button and a `Markdown` button.
- The `Markdown` button is the active button by default.
- The `Preview` and `Markdown` buttons each follow the styling and functional requirements of the `Terminal` and `Problems` tabs, including their active/inactive appearance and hover behavior.
- The `Preview` and `Markdown` buttons function as a mutually exclusive toggle: clicking one makes it the active button and the other inactive.
- Clicking the `Preview` or `Markdown` button performs no file or view action beyond toggling which button is active.
- When the loaded file is not a Markdown file, the breadcrumb bar's right side displays no buttons.

**Filename tabs**
- Each filename tab contains the file-type icon, the file name, and its adjacent `close.svg` icon.
- A filename tab's `close.svg` icon is hidden unless that tab is hovered or is the active tab; on inactive non-hovered tabs the close icon's space is preserved so revealing it causes no layout shift.
- Hovering an inactive filename tab gives it a slightly emphasized background relative to its default inactive tab background.
- A filename tab's file-type icon is resolved and rendered identically to a file tree row's file-type icon: the same Seti icon font glyph (selected by the exact-name, extension, then VS Code language priority order with the default file glyph fallback), at the same square size, in the same per-extension active-theme variant color.
- A filename tab's file-type icon is nudged down 1px relative to its flex-centered position so it vertically aligns with the tab's file name the way VS Code aligns the tab icon and label.
- The Settings tab behaves like a canvas tab and contains `settings.svg`, the title `Settings`, and its adjacent `close.svg` icon.
- The Settings tab opens `settings.html` in the canvas pane as a separate iframe.
- The Settings tab is unique; opening Settings while the tab already exists selects the existing tab and does not create a duplicate.
- Selecting the Settings tab does not change the currently selected file.
- Selecting the Settings tab does not change the file-tree highlight; the previously highlighted file row remains highlighted because it remains the current selected file.
- Closing the Settings tab returns canvas tab selection according to the same most-recently-active rule used by filename tabs.
- If two or more open filename tabs have the same file name from different directories, each conflicting tab displays the file name followed by a space and then its immediate parent directory name.
- The parent directory name in a conflicting filename tab uses a smaller font than the file name.
- The parent directory name participates in the same tab-width limit and may be fully or partially hidden by ellipsis.
- The active filename tab background matches the canvas background, not the canvas topbar background.
- The active filename tab has a 1px border on its left, right, and bottom edges; its bottom border matches the canvas background so switching tabs causes no 1px layout shift.
- Inactive filename tab backgrounds match the canvas topbar background.
- Inactive filename tabs have a 1px border on their left, right, and bottom edges.
- Each filename tab grows only as wide as needed for its file name and controls, up to a maximum width of 200px.
- Filename text that exceeds the available tab width is truncated with an ellipsis.
- Opening a file that is not already open in the filename tabs creates a new filename tab immediately to the right of the currently active filename tab.
- Opening a file when no filename tab is active creates a new filename tab at the start of the filename tab list.
- Opening a file that already has a filename tab selects the existing filename tab and does not create a duplicate.
- The newly-created or selected filename tab becomes the active filename tab immediately.
- The active filename tab is scrolled into view when it is created, selected from the file tree, or selected by closing another tab.
- Switching filename tabs displays the selected tab's file contents in the canvas.
- Clicking a filename tab's `close.svg` icon closes that filename tab.
- Closing an inactive filename tab does not change the active filename tab.
- Closing the active filename tab selects the most recently active remaining filename tab.
- Closing the active filename tab when it is the last remaining filename tab leaves the canvas pane open and displays a blank canvas.
- The blank canvas background matches the main topbar background.
- The blank canvas displays no file contents, caret, selection, line numbers, or gutter.

**Canvas**
- Center pane; renders the contents of the currently opened file.
- Renders editable text contents.
- Gutter on the left displays line numbers, one per content line, right-aligned.
- `editor.wordSeparators` defines the characters that delimit words.

**Settings page**
- `settings.html` contains a theme dropdown and a directory button.
- The Settings controls have 100px of margin around them.
- The theme dropdown contains exactly two options: `light` and `dark`.
- Changing the dropdown value changes the active root-owned theme setting.
- Changing the active theme immediately updates root-owned theme tokens and propagates the resulting styles to all iframes.
- `settings.html` displays the dropdown trigger with the current theme value as its selected text.
- `settings.html` displays the directory button with the current mounted workspace directory path as its text.

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
- When the canvas is not focused, the caret and any text selection are not rendered, but the line highlight remains.

**Unsaved changes (dirty state)**
- A filename tab is dirty when its in-memory file contents differ from the contents persisted in the VFS, having pending unsaved changes.
- The first edit made to an open file's contents in the canvas marks that file's filename tab dirty.
- A dirty filename tab displays a solid filled circle in place of its `close.svg` icon, occupying the exact position of the close icon.
- Hovering a dirty filename tab's solid circle reveals the `close.svg` icon in its place.
- Clicking the revealed `close.svg` icon on a dirty filename tab opens the unsaved-changes confirmation popup instead of immediately closing the tab.
- Closing a non-dirty filename tab follows the existing close-tab logic with no popup.

**Unsaved-changes confirmation popup**
- The popup asks `Do you want to save the changes you made to {filename}?` where `{filename}` is the dirty tab's file name.
- The popup displays the secondary line `Your changes will be lost if you don't save them.`
- The popup offers three actions: `Save`, `Don't Save`, and `Cancel`.
- Choosing `Save` closes the popup, writes the in-memory changes to the VFS, then closes the filename tab following the existing close-tab logic.
- Choosing `Don't Save` closes the popup, then closes the filename tab following the existing close-tab logic, discarding the unsaved changes.
- Choosing `Cancel` closes the popup and makes no other change; the filename tab remains open and dirty.

**Saving**
- Pressing Cmd+S while the canvas is focused on a dirty file writes the in-memory changes to the VFS.
- After a successful save, the file's contents are persisted and the filename tab's solid circle is removed, restoring the standard `close.svg` icon and indicating no pending unsaved changes.
- Making a new edit to the file's contents after saving marks the filename tab dirty again, re-displaying the solid circle.
- Writes to the VFS are routed through the root; panes never access the VFS directly.

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


# Lower Panel

**Bottom panel terminal**
- The bottom panel hosts a terminal that connects to a real shell process running on the server.
- Opening the bottom panel with no existing terminal spawns one new terminal session.
- A terminal session is backed by a server-side shell process running inside a pseudo-terminal.
- The terminal renders shell output, including colors and cursor movement, faithfully.
- Keystrokes typed into the focused terminal are sent to its shell process.
- Output produced by the shell process streams to the terminal live as it is produced.
- Ctrl+C and other control signals typed into the terminal are delivered to the shell process.
- Resizing the terminal region resizes the underlying shell process's view accordingly.
- The terminal session's working directory defaults to the current mounted workspace directory.
- Closing a terminal session terminates its underlying shell process.
- A terminal session ending on the server (its shell process exits) marks that terminal as exited.

**Terminal topbar**
- The terminal pane has a topbar equal in height to the main top bar.
- The terminal topbar height is 32px.
- The terminal topbar background matches the terminal background.
- The terminal topbar has no bottom border.
- The terminal topbar contains the `add.svg` icon right-aligned.
- The `add.svg` icon renders at 12px by 12px.
- The `add.svg` (plus) icon in the terminal topbar renders as a mask over `currentColor` so its color follows the active theme; in dark theme it uses the dark-theme foreground color and remains visible against the terminal background.
- Hovering the add control shows a 20px by 20px rounded square background using a slightly darker gray, matching the list highlight color.
- Hovering the add control uses the pointer cursor.
- Clicking the `add.svg` control creates a new terminal session and its associated terminal tab at the end of the terminal tab list.
- The newly-created terminal becomes the selected terminal immediately.
- Creating a new terminal does not terminate or alter any existing terminal session.

**Terminal topbar tabs**
- The terminal topbar contains two tabs, `Problems` and `Terminal`, left-aligned.
- Exactly one of the two tabs is the active tab at any time.
- The active tab has a slightly gray background with rounded corners and theme-appropriate strong foreground text, derived from theme tokens so it remains legible in both light and dark themes.
- The active `Problems` and `Terminal` tab background and text colors are derived from theme tokens; in dark theme the background is a slightly lighter neutral than the terminal background and the text uses the strongest dark-theme foreground color.
- The inactive tab has no background; its text uses the theme's deemphasized foreground color and becomes slightly closer to the strong foreground color on hover, in both light and dark themes.
- Clicking a tab makes it the active tab.
- When the `Terminal` tab is active, the terminal pane displays the full terminal layout, including the terminal output area and the terminal tab pane.
- When the `Problems` tab is active, the terminal pane displays only the text `No problems have been detected in the workspace.`, left-aligned and top-aligned.

**Terminal layout**
- The terminal pane is split into a terminal output area on the left and a terminal tab pane on the right.
- The terminal tab pane is right-aligned and has a 1px left border.
- The terminal tab pane width is forced to 200px and does not shrink or grow with the terminal pane size.
- The terminal output area fills the remaining width of the terminal pane to the left of the terminal tab pane.
- The terminal output area renders only the currently selected terminal's session.

**Terminal tabs**
- The terminal tab pane lists one terminal tab per terminal session.
- Each terminal tab displays `terminal.svg` immediately to the left of the label `zsh`.
- The `terminal.svg` icon renders at the same square size as the file tree row icons.
- Terminal tabs use the same icon-to-label spacing as file tree rows.
- Clicking a terminal tab selects its terminal session and displays that session in the terminal output area.
- The selected terminal tab uses the relevant Cursor list-selection style, matching the file tree row highlight, and distinguishes focused vs. unfocused states.
- A non-selected (inactive) terminal tab in the terminal tab pane uses theme-token colors so its label and icon remain legible in both light and dark themes; in dark theme inactive tab text uses the dark-theme foreground color rather than a fixed light-theme color.
- When a terminal tab is clicked directly, the selected terminal tab additionally shows a slightly darker 1px top and bottom border, matching the focused file tree row behavior.
- When focus leaves the terminal tab button because a non-tab target receives focus, the selected terminal tab remains highlighted but loses its focused top and bottom borders.
- Hovering a terminal tab uses the relevant Cursor list-selection style without top and bottom border and uses the pointer cursor.
- Terminal tab label text that exceeds the available tab width is truncated with an ellipsis.
- Each terminal tab displays the `split-horizontal.svg` icon followed by the `trash.svg` icon right-aligned after the `zsh` label.
- Hovering the split control shows a rounded square background using a slightly darker gray, matching the list highlight color, and uses the pointer cursor.
- Hovering the trash control shows a rounded square background using a slightly darker gray, matching the list highlight color, and uses the pointer cursor.
- Clicking the trash control terminates that terminal's shell process and removes both its terminal tab and its terminal pane.
- Clicking the split control splits the current terminal tab group equally in width, adding another terminal tab to that terminal tab group.

**Terminal tab groups**
- A terminal tab group is one or more terminals displayed side by side within equal-width vertical columns.
- The terminal tab group fills the full width of the terminal output area (the full bottom panel width minus the 200px terminal tab pane).
- When a terminal tab group contains a single terminal, that terminal's tab displays the `terminal.svg` icon with no prefix.
- When a terminal tab group contains exactly two terminals, the left terminal's tab prepends `"┌ "` to its `terminal.svg` icon and the right terminal's tab prepends `"└ "` to its `terminal.svg` icon.
- When a terminal tab group contains more than two terminals, the leftmost terminal's tab prepends `"┌ "`, the rightmost terminal's tab prepends `"└ "`, and every middle terminal's tab prepends `"├ "` to its `terminal.svg` icon.
- Each terminal within a terminal tab group is separated from its neighbors by the same resizable border used between the main panels.
- Dragging a terminal tab group border resizes the adjacent terminals, and each terminal re-renders its session to fit its resized width.

**Terminal scrolling**
- The lower panel as a whole never scrolls; its outer container has a hard ceiling and overflow is structurally impossible, not merely hidden.
- Only the terminal output region scrolls vertically, and it uses the same scrolling behavior as the canvas editor.
- The terminal's vertical scrollbar space is always reserved; the scrollbar's appearance causes no layout shift.
- The terminal scrollbar gutter background matches the terminal background.
- The terminal scrollbar thumb has square corners and fills the full width of the gutter.
- Terminal scrolling has no momentum; motion stops as soon as scroll input stops.
- The terminal has no horizontal scroll.

**Terminal focus and selection**
- Exactly one terminal session is the selected terminal at any time.
- Clicking inside a terminal's output region makes that terminal the selected terminal, highlights its corresponding terminal tab in the terminal tab pane, and gives that terminal keyboard focus so its caret is ready to accept input.
- Clicking a terminal tab selects that terminal's tab group, makes the terminal associated with that tab the selected terminal, highlights that tab, and gives that specific terminal keyboard focus so its caret is ready to accept input.
- Selecting a terminal directs all subsequent keystrokes to that terminal's shell process until a different terminal becomes selected.
- The terminal tab highlight and focus behavior exactly mirrors the file tree row behavior: the selected tab uses the list-selection highlight, and the focused top and bottom borders appear only when a tab button is clicked directly, matching how file tree row borders appear only on direct row clicks.
- Clicking a terminal directly highlights its corresponding tab but does not put that tab in the focused state, so no focused top and bottom borders appear on the tab from clicking the terminal output region, just as clicking the canvas to select a file row does not give that file tree row its focused borders.
- When focus leaves the terminal tab pane because a non-tab target receives focus, the selected terminal tab remains highlighted but loses its focused top and bottom borders, mirroring the file tree row losing its focused borders when focus leaves the left pane.
- Clicking inside the terminal tab pane outside any terminal tab button clears the terminal tab selection state, so no terminal tab remains highlighted or focused, mirroring how clicking inside the left pane outside any file tree row clears the file tree selection state.