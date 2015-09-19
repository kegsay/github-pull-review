# TODO

## Tooling
 - Use JSX proper given we already have a compile step with browserify. Remove `key:` on `InfoGetter` elements.
 
## UI
 - Add components for `PullRequestOverview`, `DiffView`, `CommentView` for now.
 
## Auth
 - Swap to using actual OAuth2 auth flows rather than expect the user to do the dance and splat to the input box.
 
## API
 - Add a `logic` directory and add classes for `PullRequest`, `Comment`, `Diff`, `Commit`, `GithubUser`.
 - Add classes for doing the HTTP pokes to GH: `GithubApi`.
 - Add abstraction layer between GH HTTP data and the rest of the app - we want to potentially allow sources
   other than Github if it turns out that this project works well (e.g. a noddy server which does the
   git-fu for you to splat back the required data in the right format, and said server can persist comments,
   etc).
 
## Structure
 - Use an event emitter. UI widgets should simply be emitting events and rendering what their told (by listening
   for well-defined event names), and should have ZERO logic at all (even `InfoGetter` in its' current form is
   doing too much by touching `LocalStorage`.
 - Potentially have 2 emitters on the go? UI emitter and Logic emitter (so we can more freely loosely couple logic
   and UI components).
   
# Notes

The main API endpoints we want are:
 - List of open PRs: https://api.github.com/repos/OWNER/REPO/pulls?access_token=TOKEN
 - PR: https://api.github.com/repos/OWNER/REPO/pulls/PRNUM?access_token=TOKEN
 - PR Comments: https://api.github.com/repos/OWNER/REPO/issues/PRNUM/comments?access_token=TOKEN
 - PR Line Comments: https://api.github.com/repos/OWNER/REPO/pulls/PRNUM/comments?access_token=TOKEN
 
# Goals
 - Do the OAuth dance to get a token, then show a list of projects for that user (? how - check API exists).
 - User clicks on a project and a list of PRs for that project are shown (known API)
 - User clicks on a PR and gets dumped into the "PullRequestOverview" page, aka the whole point of doing this
   project.
 - Overview page has line diffs with threaded comments (? how do we store threading info) and live edits
   (? how do we commit on behalf of the user - check API), and "done" markers (? how and where do we store
   done list - check GH API for useful places, or do `git notes`?)
 - Look and feel should be like it was using github, so same sort of CSS (though probably not a complete
   rip-off because copyright :) )
