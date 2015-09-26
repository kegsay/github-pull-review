# TODO

## Feature parity with Github
 - Add line comments to `PatchView`.
 - Add class for `PullRequest`.
 - Syntax highlighting based off file extension.
 - Hook up comments view to include line comments and subsequent commits (replacing `CommentListView` with
   `ActivityListView` which is composed of `CommentListViews`, `CommitListViews`, etc.

## New features
 - Diff slider to allow you to see diffs between any revisions of that file between relevant commits.
 - Show all line comments regardless of when they were made.
    * Mind dump: This in general is annoying to do because how do you pair up potentially very different
      files between commits? Line comments mercifully have `original_commit_id` so we may be able to abuse
      the slider to snapshot between COMMENT / COMMENT / COMMENT / NOW, maybe by having a button on the
      comment itself to say "view file as it was when this comment was made" as an alternative to a diff
      slider? So you'd have the global diff (which is what the PR API gives us) and then we can wodge in
      direct commit sha diffs for a file from NOW -> `original_commit_id` to get the diff between that
      comment and now, or also hit for diffs between BASE_BRANCH -> `original_commit_id` to see what it
      looked like "then". This would basically then be anchoring the points between comments like:
      ```
      BASE    CMT     NOW
       O---O---O---O---O
       1   2   3   4   5
       
       Two buttons on the comment:
       [See diff as it was when this comment was made] (1-3)
       [See diff after this comment was made] (3-5)
      ```
      This neatly sidesteps the problem of revisions (there aren't any) whilst giving people much needed
      context AFTER the comment was made. Plus, the APIs exist such that this isn't too computationally
      expensive to do. Follow up: We can get the commit when the branch was made via the main PR API `base.sha`. 
      We can get the current commit hash via `head.sha`, and we know the comment sha, so we're all set to use
      the `/compare` API to get the diffs. The "slider" for a file then is of size `1+NUM_COMMENTS_ON_DISTINCT_COMMITS`. We still have the problems of threading (the line commented on is often the same but not always obviously) and anchoring old line comments to new commits (if the file is say completely deleted then where do you place the comment?!).
 
## Overviews
 - Add new screens for:
    * Open PRs for a project
    * PRs I have opened / mentioned me / assigned to me.

## UX mods
 - Swap to using actual OAuth2 auth flows rather than expect the user to do the dance and splat to the input box.
 - Add "checklist" reminders when reviewing code.
 - Allow back button navigation to go back a PR?

## Tooling
 - Find a way to watch for changes in `index.css` and then do another build.


# Notes
 - Can trawl the events for a GH repo to get `PushEvents` but they only last 90 days...
 - Need somewhere to store the "done" markers. (we can do commit comments, so there maybe?)
 - Need some representation and storage of threading markers. (e.g. ID of the comment in the reply?)
 - Need some representation and storage of "comment resolved by commit X".
 
## Goals
 - Do the OAuth dance to get a token, then show a list of projects for that user (? how - check API exists).
 - User clicks on a project and a list of PRs for that project are shown (known API)
 - User clicks on a PR and gets dumped into the "PullRequestOverview" page, aka the whole point of doing this
   project.
 - Overview page has line diffs with threaded comments (? how do we store threading info) and live edits
   (? how do we commit on behalf of the user - check API), and "done" markers (? how and where do we store
   done list - check GH API for useful places, or do `git notes`?)
