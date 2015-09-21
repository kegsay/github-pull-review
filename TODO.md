# TODO

## Tooling
 - Find a way to watch for changes in `index.css` and then do another build.
 
## UI
 - Add components for `DiffView` (file with side-by-side diff, can click any line to comment), `ThreadedCommentView` (collapsible).
 
## Auth
 - Swap to using actual OAuth2 auth flows rather than expect the user to do the dance and splat to the input box.
 
## API
 - Add classes for `PullRequest`, `Comment`, `Diff`, `Commit`, `GithubUser` and actually model threading/comment resolution correctly.

## Bitty things
 - Put the repo/PR# into a URL fragment and allow back button navigation to go back a PR?
   
# Notes
 - Need somewhere to store the "done" markers. (we can do commit comments, so there maybe?)
 - Need some representation and storage of threading markers. (e.g. ID of the comment in the reply?)
 - Need some representation and storage of "comment resolved by commit X".
 
# Goals
 - Do the OAuth dance to get a token, then show a list of projects for that user (? how - check API exists).
 - User clicks on a project and a list of PRs for that project are shown (known API)
 - User clicks on a PR and gets dumped into the "PullRequestOverview" page, aka the whole point of doing this
   project.
 - Overview page has line diffs with threaded comments (? how do we store threading info) and live edits
   (? how do we commit on behalf of the user - check API), and "done" markers (? how and where do we store
   done list - check GH API for useful places, or do `git notes`?)
