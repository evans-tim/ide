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
- (DONE) real LLM
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
- (DONE) when stopping the stream on the frontend, the backend doens't properly stop the message stream and the full output token cost is incurred once the LLM is done even though the frontend had already aborted it. 
- (BUG) when editing a user message panel and then clicking away, it wont save the drafted message it just reverts, causing lost work. 
- (BUG) when adding spaces at the end of a long line, it won't linewrap. 
- (BUG) when double clicking on a word after ~1000 lines it will highlight the word 1 line above it. 
- (BUG) When hovering over an item in the slash command popup modal, the additional hover modal should show up on the left if there isn't enough room left to show it on the right. 


# Nice to Have
- right click add folder/file in tree view
- new file, new folder, and refresh explorer buttons right aligned with the root workspace dir item row. 
- be able to select and copy/paste inline mentions and commands. 