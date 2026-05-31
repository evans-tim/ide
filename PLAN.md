# Left Panel
- (DONE) Make filetree focus/selection for canvas tab focus  
- (DONE) Add file specific icons
- (DONE) Make filetree focus/selection for directory focus 
- (DONE) Edit/Save files

# Canvas
- (DONE) Add canvas topbar with filename tabs, overflow scrolling, placeholder button group, and blank-canvas empty state
- (DONE) file preview
- (DONE) md parser and preview
- edit visualizer and accept/reject

# Lower Panel
- (DONE) Add simple terminal
- (DONE) Add terminal splitting
- (DONE) Add terminal tabs

# Right Panel
- (DONE) at file feature
- (DONE) slash commands
- (DONE) chat history 
- show context usage
- real LLM
- choose model
- jsonrpc tool call
- read file tool
- edit tool
- edit visualizer
- read terminal


# VFS

- (DONE) Mount to the server's current working directory by default
- (DONE) Add Settings directory chooser
- (DONE) Reload file tree from selected mounted directory
- (NOT IMPLEMENTED) Preserve file tabs and chat tabs per mounted directory

# Settings

- (DONE) Settings icon at righthandmost side in main topbar
- (DONE) Opens settings iframe in the canvas pane as a new tab.  
- (DONE) Change theme
- (DONE) Change mounted dir


# Bugs

- (BUG) when adding spaces at the end of a long line, it won't linewrap. 
- (BUG) when double clicking on a word after ~1000 lines it will highlight the word 1 line above it. 
- (BUG) When hovering over an item in the slash command popup modal, the additional hover modal should show up on the left if there isn't enough room left to show it on the right. 