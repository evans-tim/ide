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
- The mounted workspace directory is either the server's default root (the server process's current working directory) or a module: a direct child directory of the server's hardcoded `modules` folder.
- The hardcoded `modules` folder is the `modules` directory located directly under the server process's current working directory.
- Because the browser directory picker exposes only the chosen folder's base name and never its full path, the chosen folder's base name is interpreted as a module name and resolved against the hardcoded `modules` folder, ignoring any other path information the picker would otherwise provide.
- A chosen folder whose base name matches the server root's base name mounts the server's default root instead of resolving against the `modules` folder.
- Selecting a folder whose name resolves to neither the server root nor an existing directory under the `modules` folder leaves the mounted workspace directory unchanged.
- Changing the mounted workspace directory replaces the active VFS contents with the files from the newly mounted module directory.
- Changing the mounted workspace directory clears the current file-tree selection state and the file tree updates to show the new module's files.
- Changing the mounted workspace directory collapses every directory in the file tree.
- Changing the mounted workspace directory closes every open filename tab and leaves the canvas pane on a blank canvas.
- Changing the mounted workspace directory closes every open agent chat tab, discards their conversation histories, and leaves the right panel closed.
- Changing the mounted workspace directory terminates every existing terminal session, removes their terminal tabs, and spawns one new terminal session whose working directory is the newly mounted module directory.
- (NOT IMPLEMENTED) File tabs should be saved and restored per mounted workspace directory.
- (NOT IMPLEMENTED) Agent chat tabs should be saved and restored per mounted workspace directory.

**Virtual COMMANDS directory**
- The file tree displays a virtual `COMMANDS` root directory row at the same top level as the mounted workspace root directory row, rendered in all caps with a bold font weight identically to the mounted workspace root directory row.
- The `COMMANDS` directory is backed by an in-memory virtual filesystem, not by the mounted workspace directory or any on-disk file.
- The `COMMANDS` directory contains one Markdown (`.md`) file per hardcoded slash command, named `{command-title}.md`, with initial contents equal to that command's hardcoded body.
- The `COMMANDS` directory's command files use the same hardcoded set as the slash-command autocomplete (`test-command1`, `test-command2`, `test-command3`).
- The `COMMANDS` directory and its command files behave like ordinary file tree directory and file rows for icon resolution, selection, focus, expansion, hover, indent guides, and click-to-open.
- The `COMMANDS` directory is independent of the mounted workspace directory and persists when the mounted workspace directory changes; changing the mounted directory does not clear, reload, or remove the `COMMANDS` directory or its in-memory edits.
- Clicking a `COMMANDS` command file row opens it in the canvas exactly like any other file, including Markdown preview/source toggling.
- A `COMMANDS` command file is editable and saveable in the canvas exactly like any mounted file: edits mark its filename tab dirty, and Cmd+S (or the save confirmation flow) writes the in-memory changes back to the in-memory `COMMANDS` virtual filesystem.
- Saving a `COMMANDS` command file updates that command's body in memory; the slash-command body, body-preview modal, and inserted command span body all reflect the updated saved body.
- A command's `COMMANDS` file contents and that command's slash-command body are the same single in-memory source of truth.

**Virtual SYSTEM directory**
- The file tree displays a virtual `SYSTEM` root directory row at the same top level as the `COMMANDS` root directory row, rendered in all caps with a bold font weight identically to the `COMMANDS` directory row.
- The `SYSTEM` directory is backed by an in-memory virtual filesystem, not by the mounted workspace directory or any on-disk file.
- The `SYSTEM` directory contains exactly one Markdown (`.md`) file named `system.md`, with initial contents `Single sentence responses only.`
- The `SYSTEM` directory and its `system.md` file behave like ordinary file tree directory and file rows for icon resolution, selection, focus, expansion, hover, indent guides, and click-to-open.
- The `SYSTEM` directory is independent of the mounted workspace directory and persists when the mounted workspace directory changes; changing the mounted directory does not clear, reload, or remove the `SYSTEM` directory or its in-memory edits.
- Clicking the `system.md` file row opens it in the canvas exactly like any other file, including Markdown preview/source toggling.
- The `system.md` file is editable and saveable in the canvas exactly like any mounted file: edits mark its filename tab dirty, and Cmd+S (or the save confirmation flow) writes the in-memory changes back to the in-memory `SYSTEM` virtual filesystem.
- The `SYSTEM` directory is unaffected by the `COMMANDS` directory's command-file behavior and continues to behave by its own rules; it has no slash-command association and its file is not a command file.

**System prompt sourced from SYSTEM**
- The system prompt is read from the live in-memory contents of the `SYSTEM/system.md` file.
- Whenever a prompt is sent to the LLM, the current `SYSTEM/system.md` contents are sent as the system prompt for that request, resolved at the moment of submission.
- Editing and saving the `SYSTEM/system.md` file causes subsequent submissions to use the updated saved system prompt text.

**Slash command body sourced from COMMANDS**
- A slash command's body is read from the live in-memory contents of its corresponding `COMMANDS/{command-title}.md` file.
- When a command span is inserted into the composer and the prompt is submitted, the submitted command resolves its body from the current saved `COMMANDS` file contents at submission time.
- Editing and saving a `COMMANDS` command file before referencing the command in chat causes the referenced command to carry the updated saved body text.

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
- Choosing a directory from the native directory picker uses only the chosen folder's base name, treats it as a module name, and changes the mounted workspace directory to the matching module directory under the hardcoded `modules` folder.


# Left Panel
**Left panel topbar**
- The left panel has a topbar equal in height to the main top bar.
- The left panel topbar height is 32px.
- The left panel topbar background matches the left panel background.
- The left panel topbar has no borders.
- The left panel topbar contains a `files.svg` button, followed by a `search.svg` button, followed by a `deploy.svg` button, followed by an `extensions.svg` button.
- Exactly one of the buttons is the active button at any time.
- The `files.svg` button is the active button by default.
- When the `files.svg` button is active, the left panel displays the file tree view.
- When the `search.svg` button is active, the left panel displays the search view.
- When the `deploy.svg` button is active, the left panel displays the deployments view.
- When the `extensions.svg` button is active, the left panel displays the extensions view.
- The search view displays the placeholder text `Search` at its top.
- The deployments view displays the placeholder text `Deployments` at its top.
- The extensions view displays the placeholder text `Extensions` at its top.
- Clicking a button makes it the active button and the other inactive, switching the left panel to the corresponding view.
- An active button has an emphasized background with rounded corners, derived from theme tokens.
- A hovered button has the same emphasized background with rounded corners.
- An active or hovered button's icon color uses the theme token for the strongest/black foreground text.
- An inactive, non-hovered button's icon color uses the theme token for a slightly off-black, deemphasized foreground text.
- The left panel topbar buttons and their icons render at a fixed size that does not grow, shrink, or flicker while the left panel is resized.

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
- The file tree's top-level entries are nested under a single root directory row whose label is the mounted workspace directory's base name rendered in all caps with a bold font weight.
- The root directory row is collapsible like any other directory row; collapsing it hides the entire tree and expanding it restores the previous expansion state of its descendants.
- The mounted workspace root directory row displays a `refresh.svg` button right-aligned within the root row.
- The `refresh.svg` button uses the same hover styling as the terminal tab trash and split controls: hovering shows a rounded square background using a slightly darker gray, matching the list highlight color, and uses the pointer cursor.
- Clicking the `refresh.svg` button re-reads the current mounted workspace directory's filesystem and updates the file tree to reflect any files added, deleted, or whose git status changed (including newly staged or changed files).
- The `refresh.svg` button's filesystem refresh does not change the file tree selection state, directory expansion state, open filename tabs, or any pane other than reflecting the latest filesystem and git status in the file tree and its existing git status decorations.
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

**Git status decoration**
- Git status decoration applies only when the mounted workspace directory is itself a git repository; when the mounted workspace directory is not a git repository, no file-tree row or filename tab carries any git status color or status glyph.
- A file's git status is one of: modified, new, or unchanged, as reported by git for the mounted workspace directory.
- A modified file's file-tree row file name is rendered in color `rgb(184, 136, 67)`, and an `M` glyph in the same color `rgb(184, 136, 67)` is added to the same row container, right-aligned with an 8px margin to the right.
- A new file's file-tree row file name is rendered in color `rgb(88, 126, 139)`, and a `U` glyph in the same color `rgb(88, 126, 139)` is added to the same row container, right-aligned with an 8px margin to the right.
- A modified file that is staged for commit has its file-tree row file name and its `M` glyph rendered in color `rgb(152, 122, 77)` instead of the unstaged modified color, with the `M` glyph and right-alignment otherwise unchanged.
- A new file that is staged for commit has its file-tree row file name rendered in color `rgb(106, 158, 134)` instead of the unstaged new color, and its right-aligned status glyph changes from `U` to `A` rendered in the same color `rgb(106, 158, 134)`, with the right-alignment otherwise unchanged.
- An unchanged file's file-tree row file name and container carry no git status color or status glyph.
- The same git status decoration applies to canvas filename tabs: a modified file's filename tab renders its file name and an appended right-aligned `M` glyph (8px right margin) in `rgb(184, 136, 67)`, and a new file's filename tab renders its file name and an appended right-aligned `U` glyph (8px right margin) in `rgb(88, 126, 139)`.
- The same staged-for-commit decoration applies to canvas filename tabs: a staged modified file's filename tab renders its file name and `M` glyph in `rgb(152, 122, 77)`, and a staged new file's filename tab renders its file name in `rgb(106, 158, 134)` with its glyph changed from `U` to `A` in the same color `rgb(106, 158, 134)`.
- The git status status glyph is part of the same container as the file name in both the file-tree row and the filename tab.

**Directory git status decoration**
- A directory's git status is derived from its descendants: a directory is decorated when it transitively contains at least one file or directory that carries a git status (new, new-staged, modified, or modified-staged).
- A decorated directory's directory-row name is rendered in the same git status color as its derived status, matching the file-row name colors: new uses `rgb(88, 126, 139)`, new-staged uses `rgb(106, 158, 134)`, modified uses `rgb(184, 136, 67)`, and modified-staged uses `rgb(152, 122, 77)`.
- A decorated directory row displays a solid filled circle icon, visually identical to the filename tab's dirty-save circle, rendered in the directory's derived git status color at a slightly reduced opacity, right-aligned in the same position and with the same right margin as the file-row status glyph.
- A directory's derived git status resolves new and new-staged statuses with precedence over modified and modified-staged statuses: if any descendant carries a new or new-staged status, the directory uses the new color family even when other descendants carry modified or modified-staged statuses.
- The directory git status circle is part of the same container as the directory name, occupying the right-aligned status position; it is a solid circle and never an `M`, `U`, or `A` status glyph.
- Directory git status decoration applies only when the mounted workspace directory is itself a git repository, by the same condition that governs file git status decoration; when the mounted workspace directory is not a git repository, no directory row carries any git status color or circle.
- File-row git status decoration is unaffected by directory git status decoration and continues to render its own `M`, `U`, or `A` status glyph and name color by its own existing rule.

**File tree scrolling**
- The file tree scrolls vertically when its content exceeds the available height, and it uses the same scrolling behavior as the canvas editor.
- The file tree's vertical scrollbar space is always reserved; the scrollbar's appearance causes no layout shift.
- The file tree scrollbar gutter background matches the file tree background.
- The file tree scrollbar thumb has square corners and fills the full width of the gutter.
- File tree scrolling has no momentum; motion stops as soon as scroll input stops.
- The file tree has no horizontal scroll.





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
- The right panel topbar `add.svg` (plus) icon has an 8px left margin.
- The right panel topbar displays a `clockface.svg` control 2px to the right of the `add.svg` icon, using the same hover styling as the add control.
- Hovering the add control shows a 20px by 20px rounded square background using a slightly darker gray, matching the list highlight color.
- Hovering the close control shows a 20px by 20px rounded square background using a slightly darker gray, matching the list highlight color.
- The `chat.svg` icon renders at 16px by 16px.
- The `close.svg` icon renders at 12px by 12px.
- The `add.svg` icon renders at 12px by 12px.

**Chat history modal**
- Clicking the `clockface.svg` control opens a chat history popup modal beneath it.
- The modal's top-right corner is aligned with the bottom-left corner of the clockface control.
- The modal casts a shadow on its edges and has rounded corners, matching the file-mention autocomplete modal's shadow and corner styling.
- The modal lists every chat that has occurred since the server was started, one item per row, in the same single-row hover-styled list layout as the file-mention autocomplete items.
- The chat history is held in server memory and is cleared when the server restarts; chats from prior server runs are not listed.
- Each chat history item displays that chat's title, truncated with a trailing ellipsis when there is not enough room.
- Hovering a chat history item gives it the emphasized background; at most one item has the emphasized background at any time.
- The first item in the list is highlighted by default.
- Clicking a chat history item, or pressing Enter while it is highlighted, opens that chat.
- Opening a chat that is not currently open in any agent tab opens it in a new agent tab.
- Opening a chat that is already open in an agent tab activates that existing tab instead of creating a duplicate.
- Clicking outside the open chat history modal closes the modal.

**Tabs**
- Each tab contains the `chat.svg` icon, its title text, and its adjacent `close.svg` icon.
- A tab's `close.svg` icon is hidden unless that tab is hovered or is the active tab; on inactive non-hovered tabs the close icon's space is preserved so revealing it causes no layout shift.
- Hovering an inactive tab gives it a slightly emphasized background relative to its default inactive tab background.
- While a tab has a submission running, its `chat.svg` icon is replaced by `spinner.svg`.
- The active tab background matches the main right panel background, not the right panel topbar background.
- The active tab has a 1px border on its right edge only, to avoid doubled borders between adjacent tabs.
- Inactive tab backgrounds match the right panel topbar background.
- Inactive tabs have a 1px border on their right edge only, to avoid doubled borders between adjacent tabs.
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

**Agent chooser**
- The prompt composer affordance contains an agent chooser control aligned to the left side of the affordance area, at the same vertical position as the send control on the right.
- The agent chooser displays the selected model's display name (not its model ID) in the strongest foreground theme token (black in light mode).
- The agent chooser displays a down-chevron icon immediately to the right of the display name, using the theme's de-emphasized foreground color token.
- Hovering the agent chooser shows an emphasized background with 4px margin on all sides, rounded corners, and darkens the chevron slightly; hovering uses the pointer cursor.
- Clicking the agent chooser opens a model-selection modal in the same visual style as the file-mention autocomplete modal (rounded corners, shadow on left/right/bottom edges).
- The modal is positioned such that it appears below the agent chooser button when there is sufficient viewport space below it, otherwise it appears above the button; in both cases the modal's left edge is aligned with the button's left edge.
- The modal lists exactly three selectable model items: `claude-opus-4-8` (display name `Claude Opus 4`), `claude-sonnet-4-6` (display name `Claude Sonnet 4.5`), and `claude-haiku-4-5` (display name `Claude Haiku 4.5`), in that order.
- Each model item displays only its display name.
- Hovering a model item gives it the emphasized background and uses the pointer cursor; at most one item has the emphasized background at any time.
- Clicking a model item sets that model as the currently selected model, closes the modal, and updates the agent chooser to display that model's display name.
- The first item in the list is highlighted with the emphasized background by default when the modal opens.
- Pressing Enter while a model item is highlighted sets that model as the currently selected model and closes the modal.
- Clicking outside the open model-selection modal closes the modal without changing the selected model.
- The default selected model is `claude-sonnet-4-6`.
- The agent chooser is unaffected by the send control and continues to behave by its own rule; it is not a general purpose button or dropdown trigger.
- The cost logger computes per-token cost using the pricing for the currently selected model; switching the selected model changes the per-token rate applied to all subsequent cost calculations.
- The cost logger's model pricing is: `claude-opus-4-8` at the Opus 4 rate, `claude-sonnet-4-6` at the Sonnet 4.5 rate, and `claude-haiku-4-5` at the Haiku 4.5 rate.


**File mention autocomplete**
- Typing `@` in the prompt composer opens a file-mention autocomplete div directly beneath the `@` character.
- The autocomplete div's left edge stays aligned with the left of the `@` character even as a longer refinement sequence is typed after it.
- Each autocomplete item lays out its filename and parent path with the following ellipsis priority when there is not enough room: the filename is shown first; if the filename alone does not fit, the filename is truncated with an ellipsis and the parent path is not displayed; if the filename fits, the parent path is shown and truncated with an ellipsis only when it does not fit.
- The autocomplete div stays left-aligned with the left edge of the `@` character even as a longer refinement sequence is typed after it.
- Within each autocomplete item, the file name is truncated with a trailing ellipsis when there is not enough room, and the file name truncates before the parent path string is reduced.
- Within each autocomplete item, the parent path string is truncated with a trailing ellipsis when there is not enough room for the path string.
- The autocomplete div is 200px wide and casts a shadow on its left, bottom, and right edges.
- By default the autocomplete div lists every currently open tab as a selectable item.
- The first item in the list is highlighted with an emphasized background color by default and rounded corners
- Each item has a 2px margin on all sides.
- Each item displays the file's file-type icon on the left, then the file name in the strongest foreground theme token, then the relative path to its parent directory (or nothing if it has no parent) in a slightly lighter foreground theme token and a slightly smaller font token.
- Hovering an item gives it the emphasized background; at most one item has the emphasized background at any time.
- Moving the highlight to an item by hover removes the emphasized background from any other item.
- Clicking an item, or pressing Enter while it is highlighted, selects that item.
- Selecting an item closes the autocomplete div and inserts an inline mention span in place of the `@` (and any typed refinement characters) at that position in the composer.
- After insertion the text cursor is placed immediately after the inserted span, ready to type or to begin another `@` mention.
- Typing characters directly after `@` refines the list to file names in the workspace that start with that exact character sequence (prefix match, no fuzzy matching).
- When no workspace file name starts with the typed sequence, the autocomplete div does not show and the `@` plus the typed sequence remain as ordinary composer text.
- Pressing space after a sequence beginning with `@` leaves the `@` and the sequence as ordinary composer text and inserts no mention span.

**File mention span**
- A file mention span displays the file's file-type icon followed by the file name.
- The mention span file name text uses color `rgb(111, 144, 155)` (or the relevant theme token when available).
- The mention span background uses color `rgb(235, 239, 240)` (or the relevant theme token when available) and has rounded corners.
- Hovering anywhere on the mention span uses the pointer cursor.
- Hovering the mention span makes the entire span slightly brighter (filter: brightness(1.02)).
- Hovering the mention span replaces the file-type icon with `close.svg`, colored `rgb(111, 144, 155)` (or the relevant theme token when available).
- Hovering the mention span causes no layout shift whatsoever; the icon swap, brighten, and tooltip do not change the span's size or position or move any surrounding content.
- Clicking the close icon removes the mention span (and tooltip) from the composer.
- Clicking the mention span anywhere other than the close icon opens that file in the canvas, creating a new tab if it is not already open or activating its existing tab if it is.
- Pressing Backspace when the text cursor is immediately after a mention span removes that span (and tooltip).
- Hovering the mention span shows a tooltip div directly above it.
- The tooltip text uses the strongest foreground theme token and displays the file's full relative path including the file name, with the workspace root parent omitted.
- The tooltip text is left-aligned and the tooltip is left-aligned flush with the span's left edge.
- The tooltip has 4px of padding on all sides around its text.
- The bottom edge of the tooltip is exactly flush with the top edge of the mention span.
- The tooltip has a 1px border and slightly rounded corners, matching the mention span's corner rounding.
- The tooltip has a slight shadow on all edges.
- The tooltip renders above all other content (including the topbar) and is never clipped by the composer's bounds.

**File mention persistence across composer/message states**
- Mentions are preserved in the per-tab composer draft when switching tabs and restored verbatim, including their icon, file name, background, hover, tooltip, click-to-open, and close behaviors.
- Submitting a prompt that contains mentions renders each mention as the same inline mention span inside the resulting submitted user message panel, in its original position within the surrounding text.
- A mention span inside a submitted user message panel retains its background, rounded corners, file name color, but DISABLES the hover-brighten, hover icon swap to `close.svg`, tooltip, and click-to-open behavior. It should have cursor: default on hover that overrides the cursor: pointer of the entire user message panel, but clicking on it should still open the user message panel edit mode (composer).
- Removing a mention via its close icon is not offered inside a submitted user message panel while it is in its non-editing display state, because submitted panels show no per-message editing affordances until clicked. All pointer related behavior should be disabled when the mention is in the user message panel. 
- Clicking a submitted user message panel to edit it converts it into an in-place prompt composer that still contains the mention spans at their original positions, with full mention behavior (including close-to-remove) restored.
- Backspace-to-remove and close-icon-to-remove apply to mentions inside the in-place prompt composer exactly as they do in the bottom prompt composer.
- Re-submitting an in-place prompt composer preserves the remaining mentions in the resulting submitted user message panel.

**Slash command autocomplete**
- Typing `/` in the prompt composer opens a slash-command autocomplete div directly beneath the `/` character, with the same alignment behavior as the file-mention autocomplete.
- The autocomplete div's left edge stays aligned with the left of the `/` character even as a longer refinement sequence is typed after it.
- The autocomplete div has the same width and shadow as the file-mention autocomplete div.
- The autocomplete lists a fixed, hardcoded set of commands: `test-command1` (body `test body 1`), `test-command2` (body `test body 2`), and `test-command3` (body `test body 3`).
- Each command item displays its command title left-aligned in the strongest foreground theme token.
- Each command item displays its command body left-aligned on a single forced new line beneath the title, truncated with a trailing ellipsis on overflow.
- The first item in the list is highlighted with an emphasized background color by default and rounded corners.
- Each item has a 2px margin on all sides.
- Hovering an item gives it the emphasized background; at most one item has the emphasized background at any time, and moving the highlight to an item by hover removes the emphasized background from any other item.
- Hovering a command item shows a body-preview modal whose vertical center aligns with the vertical center of the hovered item div, with the same width as the autocomplete div and rounded corners.
- The body-preview modal displays the command title in its upper-left in the strongest foreground theme token, then the full command body text on a new line.
- The body-preview modal grows to whatever height is necessary to fit the full command body text without truncation.
- Clicking an item, or pressing Enter while it is highlighted, selects that item.
- Selecting an item closes the autocomplete div and inserts an inline command span in place of the `/` (and any typed refinement characters) at that position in the composer.
- After insertion the text cursor is placed immediately after the inserted span, ready to type or to begin another `/` command.
- Typing characters directly after `/` refines the list to command titles that start with that exact character sequence (prefix match, no fuzzy matching).
- When no command title starts with the typed sequence, the autocomplete div does not show and the `/` plus the typed sequence remain as ordinary composer text.
- Pressing space after a sequence beginning with `/` leaves the `/` and the sequence as ordinary composer text and inserts no command span.

**Slash command span**
- A command span displays the command title prepended by a `/`, with no leading icon and no close icon.
- The command span `/` prefix and title text use color `rgb(184, 136, 67)`.
- The command span background uses color `rgb(243, 237, 229)` and has rounded corners, in a style matching the file mention span.
- Hovering the command span makes the entire span slightly brighter (filter: brightness(1.02)), matching the mention span hover brightness behavior.
- Clicking the command span anywhere is a no-op.
- The command span has no close icon and cannot be removed by clicking; it can only be removed by Backspace.
- Pressing Backspace when the text cursor is immediately after a command span removes that span.
- Hovering the command span shows no body-preview modal; the body-preview modal appears only on the autocomplete items while typing the command.

**Slash command persistence across composer/message states**
- Command spans are preserved in the per-tab composer draft when switching tabs and restored verbatim, including their background, hover-brighten, no-op click, and Backspace-to-remove behaviors.
- Submitting a prompt that contains command spans renders each command span in the resulting submitted user message panel, in its original position within the surrounding text.
- A command span inside a submitted user message panel retains its background, rounded corners, and title color, but disables hover-brighten, the body-preview modal, and pointer behavior, matching the file mention span's submitted-panel behavior.
- Clicking a submitted user message panel to edit it restores full command span behavior at the original positions within the in-place prompt composer.
- Re-submitting an in-place prompt composer preserves the remaining command spans in the resulting submitted user message panel.

**Slash command resolution when sending to the LLM**
- The conversation sent to the LLM is a text serialization of each user message, distinct from its rendered UI representation; the UI rendering of command spans is never altered by this resolution.
- When a user message is serialized for the LLM, every command span within it is replaced by that command's current body text, resolved from the live in-memory `COMMANDS/{command-title}.md` contents at the moment of submission.
- The command span's body text replaces the span at its exact position in the surrounding message text, so the resolved body is inlined inline with any other text and mentions in that message.
- Body resolution applies to every command span in every user message of the conversation, including command spans from prior turns, not only the message being submitted in the current turn.
- A multiturn conversation sent to the LLM therefore contains the resolved body text for every command span across all turns, while the right panel continues to display those command spans verbatim as command spans.
- If a command's `COMMANDS` body has been edited and saved since a command span was inserted in an earlier turn, the resolution uses the latest saved body at the current submission time for that earlier span as well.
- File mention spans continue to serialize by their own existing rule and are unaffected by command-span body resolution.

**File mention content replacement when sending to the LLM**
- When a user message is serialized for the LLM, every file mention span within it is replaced by the entire current contents of the mentioned file, prepended with the file's name followed by a colon and a single newline (`{filename}:\n`).
- The mentioned file's full contents are inlined verbatim, as-is, with no truncation, summarization, or other transformation.
- The file contents replace the mention span at its exact position in the surrounding message text, inlined inline with any other text and command spans in that message.
- File content replacement applies to every file mention span in every user message of the conversation, including mentions from prior turns, not only the message being submitted in the current turn.
- The mentioned file's contents are resolved from the current VFS contents at the moment of submission, so a multiturn conversation sent to the LLM contains the latest contents for every mentioned file across all turns.
- This replacement affects only the LLM text serialization; the UI rendering of file mention spans is never altered, and the right panel continues to display those mention spans verbatim.
- Command spans are unaffected by file mention content replacement and continue to be serialized by their own existing command-span body resolution rule.

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
- When focus leaves the in-place prompt composer without submitting, the current draft text is saved to that message's in-place draft; the panel converts back into a submitted user message panel displaying the original submitted text, but the in-place draft is preserved.
- Re-clicking a submitted user message panel that has a saved in-place draft restores the draft text into the in-place composer, not the original submitted text.
- The in-place draft is discarded only when the in-place composer is re-submitted or the conversation history for that message is otherwise replaced.
- Clicking a different submitted user message panel while an in-place prompt composer is active closes the active in-place composer and opens the clicked message panel as an in-place prompt composer in the same click.
- The bottom prompt composer remains visible while a submitted user message is being edited in place.
- Submitting from an in-place prompt composer replaces that user message with the submitted text, submits the conversation from that point, and removes every later message and response from the conversation history.
- While a submitted user message panel is hovered, a rounded stop control appears inside the panel on the right-hand side for as long as the response to that message is not complete.
- Immediately after chat submission, `Planning next moves` displays beneath the just-submitted user message panel with 12px of margin above it.
- The response is produced by a single hardcoded LLM model; submitting a prompt sends the conversation to the model and begins streaming its response into the active chat.
- `Planning next moves` displays until the first response token arrives, then is replaced by the streaming response.
- Response tokens render incrementally as they arrive, appended in order, until the model finishes.
- When the model finishes on its own, the streamed text becomes the final response and the chat exits the stop state back to the send state.
- Pressing the stop control while a response is streaming aborts the in-flight request and stops further tokens from arriving.
- Aborting via stop finalizes the tokens already received as the completed response and exits the stop state back to the send state; an aborted response is indistinguishable from a completed one except that it contains only the tokens received before the abort.
- Each chat tab streams its response independently, so a response streaming or aborting in one tab does not affect any other tab's conversation or composer state.
- Subsequent submissions append a new user message panel beneath the previous response, followed by its own streamed response; prior messages and responses remain visible above.
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
- When the loaded file is a Markdown (`.md`) file, the breadcrumb bar's right side displays a `Preview` button and a `Source` button.
- The `Source` button is the active button by default.
- The `Preview` and `Source` buttons each follow the styling and functional requirements of the `Terminal` and `Problems` tabs, including their active/inactive appearance and hover behavior.
- The `Preview` and `Source` buttons function as a mutually exclusive toggle: clicking one makes it the active button and the other inactive.
- Clicking the `Source` button while it is inactive makes it active and displays the raw Markdown source in the editable canvas editor.
- Clicking the `Preview` button while it is inactive makes it active and replaces the editable canvas editor with the rendered Markdown preview of the current file contents.
- When the loaded file is an HTML (`.html`) file, the breadcrumb bar's right side displays a `Preview` button and a `Source` button, following the same styling and toggle behavior as the Markdown `Preview` and `Source` buttons.
- The HTML `Source` button is the active button by default.
- Clicking the HTML `Source` button while it is inactive makes it active and displays the raw HTML source in the editable canvas editor.
- Clicking the HTML `Preview` button while it is inactive makes it active and replaces the editable canvas editor with an iframe that runs the current in-memory HTML source and fills the entire canvas content region the editor occupied.
- The Markdown breadcrumb `Preview`/`Source` buttons are unaffected by the HTML buttons and continue to render only for Markdown files and to toggle the Markdown preview by their own existing rule.
- When the loaded file is neither a Markdown nor an HTML file, the breadcrumb bar's right side displays no buttons.

**Markdown preview**
- The preview is produced by a custom Markdown parser and renderer that converts the file's current in-memory Markdown source into HTML; no third-party Markdown library is used.
- The preview always renders the current in-memory contents, including any unsaved edits, not the persisted VFS contents.
- Switching back to `Source` returns to the editable editor showing the same in-memory source the preview was rendered from.
- The preview is read-only: it displays no caret, no line numbers, and no gutter, and its text is not editable.
- The preview occupies the same canvas content region the editor occupied, scrolls vertically with the same scrolling behavior as the canvas editor, and has no horizontal scroll.
- The preview re-renders from the in-memory source each time `Preview` becomes active.
- Each open Markdown filename tab independently remembers whether it is in `Source` or `Preview` mode.
- Preview text uses the workbench/interface font stack; fenced code blocks and inline code use the editor monospace font stack.
- All preview colors are derived from theme tokens and remain legible in both light and dark themes.

**Markdown block parsing**
- The parser splits the source into block-level elements: paragraphs, headings, blockquotes, lists, fenced code blocks, indented code blocks, horizontal rules, and tables.
- Blank lines separate adjacent blocks; consecutive non-blank lines within a paragraph are joined into a single paragraph.
- A line beginning with one to six `#` characters followed by a space is an ATX heading of the corresponding level (`#` is level 1 through `######` is level 6); trailing `#` characters are stripped.
- A line of text immediately followed by a line of only `=` characters is a level-1 heading; a line of text immediately followed by a line of only `-` characters is a level-2 heading (Setext headings).
- A line of three or more `-`, `*`, or `_` characters (optionally separated by spaces) on its own is a horizontal rule.
- Lines beginning with `>` form a blockquote; nested `>` prefixes produce nested blockquotes, and blockquote contents are themselves parsed as blocks.
- A fenced code block opens with a line of three or more backticks or three or more tildes and closes with a matching fence; the opening fence's trailing text is the optional language info string.
- Fenced code block contents are treated literally with no inline parsing and no escaping interpretation beyond HTML-safety.
- A block of lines each indented by four or more spaces (or one tab) is an indented code block rendered literally.

**Markdown lists**
- A line beginning with `-`, `*`, or `+` followed by a space is an unordered list item.
- A line beginning with a number followed by `.` or `)` and a space is an ordered list item; the first item's number sets the list's start value.
- Consecutive list items of the same type form a single list; switching marker type starts a new list.
- A list item may contain multiple lines and nested blocks; lines indented under a list item belong to that item, and further-indented list markers produce nested lists.
- An unordered list item whose content begins with `[ ]` or `[x]` (case-insensitive) is a task list item rendered with an unchecked or checked, non-interactive checkbox before its text.

**Markdown tables**
- A line of cells delimited by `|`, immediately followed by a delimiter line of cells made of `-` (optionally with leading/trailing `:` for alignment), begins a table; subsequent contiguous `|`-delimited lines are body rows.
- The header row's cells become the table header; each delimiter cell's colons set its column's alignment to left (`:-`), right (`-:`), center (`:-:`), or default (none).
- Body rows with fewer cells than the header pad with empty cells; extra cells beyond the header count are dropped.
- Inline parsing applies to every table cell's contents.

**Markdown inline parsing**
- Inline parsing applies to the text content of paragraphs, headings, list items, blockquotes, and table cells, but not to code spans or code blocks.
- Text wrapped in single `*` or `_` renders as emphasis (italic); text wrapped in double `**` or `__` renders as strong (bold); double markers take precedence over single.
- Text wrapped in double `~~` renders as strikethrough.
- Text wrapped in single backticks renders as an inline code span using the monospace font; the longest run of backticks needed to delimit literal backtick content is respected.
- `[text](url)` renders as a link with the given visible text and destination; `[text](url "title")` sets the link's title.
- `![alt](url)` renders as an image with the given alternative text and source; `![alt](url "title")` sets the image's title.
- A bare URL beginning with `http://` or `https://` renders as an autolink.
- A `\` before a Markdown punctuation character escapes it so the character renders literally with no special meaning.
- A trailing run of two or more spaces, or a backslash, at the end of a line within a paragraph produces a hard line break.

**Markdown rendering and safety**
- Every character drawn from the source is HTML-escaped so raw `<`, `>`, and `&` in the source render as literal text rather than as markup.
- Raw HTML embedded in the Markdown source is not interpreted as markup; it is rendered as escaped literal text.
- Link and image destinations are emitted as-is for `http`, `https`, relative, and anchor targets; `javascript:` and other script-bearing schemes are not emitted as active destinations.
- Headings, paragraphs, lists, blockquotes, code blocks, tables, horizontal rules, links, images, and inline spans each render as their corresponding semantic HTML element.
- Malformed or unterminated constructs (e.g., an unclosed code fence, emphasis, or link) render their literal source text rather than producing broken markup.

**HTML preview**
- The HTML preview is an iframe whose document is the current in-memory HTML source, including any unsaved edits, not the persisted VFS contents.
- The HTML preview iframe runs the source as a live document, executing its scripts and applying its styles, and fills the entire canvas content region the editor occupied.
- Switching back to `Source` returns to the editable editor showing the same in-memory source the preview was running.
- The HTML preview is not the editable editor: it displays no caret, no line numbers, and no gutter.
- The HTML preview re-runs the in-memory source each time `Preview` becomes active.
- Each open HTML filename tab independently remembers whether it is in `Source` or `Preview` mode.
- The HTML preview is unaffected by the Markdown preview rules and continues to behave by its own rules.

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
- The active filename tab has a 1px border on its right edge only, to avoid doubled borders between adjacent tabs.
- Inactive filename tab backgrounds match the canvas topbar background.
- Inactive filename tabs have a 1px border on their right edge only, to avoid doubled borders between adjacent tabs.
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

**Canvas added line decoration**
- A content line that is added relative to git (a line present in the canvas's in-memory contents but absent from the file's committed git version) is decorated as an added line.
- An added content line's row background is `rgb(228, 238, 233)`, spanning the line's full row height.
- An added content line additionally displays a slim vertical bar of color `rgb(56, 136, 102)` positioned immediately to the right of the line-number gutter, with the bar's height equal to the line's row height.
- Added-line decoration applies only when the mounted workspace directory is itself a git repository, by the same condition that governs file git status decoration; when the mounted workspace directory is not a git repository, no canvas line carries added-line decoration.
- The line-number gutter, caret, and text selection are unaffected by added-line decoration and continue to behave by their own existing rules; the added-line background and bar are decoration drawn beneath them.
- On an added content line that is also the caret line, the caret-line highlight is composited as a semi-transparent overlay over the added-line background rather than replacing it, so the two colors mix; with the added background `rgb(228, 238, 233)` and the highlight at 50% opacity, the resulting blended row color is `rgb(215, 225, 220)`.
- The added-line green vertical bar and the line's text remain fully visible above the caret-line highlight overlay on an added caret line.
- On a content line that is not added, the caret-line highlight continues to render as a solid background by its own existing rule and is unaffected by the added-line overlay compositing.

**Canvas modified/deleted line decoration**
- A run of one or more content lines that is deleted relative to git (lines present in the file's committed git version but absent from the canvas's in-memory contents) is decorated as a deleted-line marker at the position where the deletion occurred.
- A deleted-line marker is drawn as its own decoration row at the boundary between the surviving content lines that surround the deletion; it does not represent any in-memory content line and carries no caret position, line number, or editable text.
- A deleted-line marker displays the removed line's text from the file's committed git version, with leading and interior whitespace preserved, rendered in the de-emphasized line-number foreground color so it reads as read-only deleted content rather than editable text.
- Each removed line in a multi-line deletion gets its own deleted-line marker row, one per removed line, in committed order.
- A deleted-line marker's row background is `rgb(248, 237, 239)`, spanning the marker row's full height.
- A deleted-line marker additionally displays a slim vertical bar of color `rgb(198, 61, 87)` positioned immediately to the right of the line-number gutter, with the bar's height equal to the marker row's height, matching the added-line bar's placement and width.
- A deletion at the very top of the file renders its marker above the first surviving content line, and a deletion at the very bottom renders its marker below the last surviving content line.
- Deleted-line decoration applies only when the mounted workspace directory is itself a git repository, by the same condition that governs file git status decoration; when the mounted workspace directory is not a git repository, no deleted-line marker is rendered.
- The line-number gutter, caret, text selection, and added-line decoration are unaffected by deleted-line decoration and continue to behave by their own existing rules; a deleted-line marker introduces no gutter number and is never itself an added line.
- A modified line has no dedicated decoration; following git, a modification is represented as the deletion of the old line plus the addition of the new line, so it renders as a deleted-line marker (for the removed content) immediately followed by an added-line decoration (for the new content) on the surviving content line.

**Line wrapping**
- A content line whose rendered width exceeds the available canvas text width wraps onto one or more additional visual rows instead of scrolling horizontally.
- A wrapped visual row displays no line number; only the first visual row of a content line carries that content line's gutter number.
- The wrap point is computed exactly from the canvas text width and the editor monospace metrics, not approximated; the number of wrapped rows is the deterministic result of that calculation for the given content and width.
- The available canvas text width is the canvas content region width minus the gutter width and the reserved vertical scrollbar gutter width.
- Changing the canvas text width (e.g. resizing the center pane) recomputes every content line's wrap points and visual rows exactly.
- Wrapped visual rows of a content line align their left edge with the start of the first visual row's text, immediately to the right of the gutter.
- The caret-line highlight, text selection, and caret position all follow the wrapped visual layout, treating each visual row as part of its content line.

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

**Scrollbar diff markers**
- The canvas vertical scrollbar gutter renders a diff marker for every line that carries added-line or deleted-line decoration, overlaying the gutter without obscuring the scrollbar thumb's contents underneath.
- Each added content line contributes a green marker of color `rgb(56, 136, 102)` in the scrollbar gutter, and each deleted-line marker contributes a red marker of color `rgb(198, 61, 87)` in the scrollbar gutter.
- A scrollbar diff marker is positioned vertically so its location in the gutter corresponds precisely to its decorated line's position within the full scrollable content height, mapping the full content height onto the full scrollbar gutter height.
- The scrollbar diff marker mapping is exact and stays correct at every canvas viewport height, including every height the canvas takes as the lower panel opens, closes, or is resized; the mapping must be recomputed against the canvas's current viewable height, never against a stale or fixed height.
- The mapping must precisely account for every element that affects the available height of the scrollable canvas content region, including the canvas topbar, the canvas file breadcrumb bar, the lower panel, and any other chrome above or below the scrollable region; the diff marker gutter height equals the scrollable content region's actual rendered height after all such elements are subtracted, never the full pane or viewport height.
- The scrollbar diff marker mapping is the same mapping that positions the scrollbar thumb: the gutter height, content height, and per-line offsets used to place a diff marker are identical to those used to size and position the thumb, so a diff marker and the thumb always agree about where a given content line sits in the gutter.
- Because the thumb represents the currently viewable section of the canvas, whenever a decorated line is within the viewable section the thumb spans that line's diff marker, and a decorated line at the exact top or exact bottom edge of the viewable section aligns with the thumb's top or bottom edge respectively (e.g. a green added line visible as the very last viewable line places its green marker precisely at the bottom edge of the thumb).
- Scrollbar diff markers reflect the same in-memory diff state that drives the canvas added-line and deleted-line decorations, so a line shown with a green bar in the editor has a green scrollbar marker and a deleted-line marker shown with a red bar in the editor has a red scrollbar marker.
- Scrollbar diff markers remain at their content-proportional positions regardless of the current scroll position, so they always indicate where changes are within the entire file.
- Scrollbar diff markers apply only when the mounted workspace directory is itself a git repository, by the same condition that governs the canvas added-line and deleted-line decoration; when the mounted workspace directory is not a git repository, the scrollbar gutter carries no diff markers.
- The scrollbar thumb and its ability to let content exist underneath it are unaffected by scrollbar diff markers and continue to behave by their own existing rules; the diff markers are decoration drawn within the gutter.

**Scroll past end**
- The canvas can always be scrolled until the last line is precisely flush with the top edge of the canvas viewport, regardless of file length.
- Even a single-line file is scrollable due to small padding above first line. 
- Alignment is exact: zero subpixel offset between the top of the last line and the viewport's top edge at maximum scroll.

**Scroll affordance**
- When the canvas is not scrolled to the very top, a subtle shadow appears along the top border spanning the full canvas width.
- The shadow appears below the canvas file breadcrumb bar, along the top border of the scrollable content region, not over the breadcrumb bar or canvas topbar.
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