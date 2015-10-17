# Github Pull Review (GPR)
*A better way to review pull requests.*

[Try it out!](http://kegsay.github.io/github-pull-review/#/repos/kegsay/matrix-neb/8/diffs)

Github's UI for reviewing pull requests isn't great. You can't:
 * Do live code edits to code snippets
 * Mark review comments as "done" (and see a summary comments which are done/not done)
 * Have comment threading (heaven forbid there are >1 distinct issues on a line of code!)
 * Tie comment resolution to commits (any old commit which alters the file just marks the comment as "outdated")
 
This project aims to fix these issues, whilst maintaining the familiarity, look and feel of the existing pull request system. To that end, this project makes heavy use of the Github API, rather than rolling its own system for tracking pull requests and comments.

This is all also hosted on [Github pages](http://kegsay.github.io/github-pull-review/) but you can also `git clone` this repo and run it locally.

## Difference between GPR and Github's UI

Currently, GPR does the following over and above Github's UI:
 - Provides buttons along with each line comment to see "this file *when* this comment was made" and "this file *after* this comment was made"
 - Show line comments that were made on this file several commits ago (Github doesn't show these at all, GPR gates them behind "Show all comments")
 - Show/Hide per-file
 
Github Pull Review doesn't currently do the following things Github's UI does:
 - Merge/Close button
 - Provide syntax highlighting on code
 - Provide an "Activity stream" of comments and commits chronologically.

## Access tokens

You need to provide an access token in order to access the Github APIs. You can create a "Personal Access Token" in your account settings. A token is required in order to leave comments!

## Building locally
First, `git clone` this repo. Then:

```
 $ npm install
 $ npm run build
```

Then host the `build` folder (e.g. using `http-server`). **The** `build` **directory is actually a submodule pointing to** `gh-pages`. If you would prefer to get the build that is running from `gh-pages`, then:

```
 $ cd build
 $ git submodule update --init --recursive
```
