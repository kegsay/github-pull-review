# Github Pull Review (GPR)
[![Build Status](https://travis-ci.org/Kegsay/github-pull-review.svg)](https://travis-ci.org/Kegsay/github-pull-review)

*A better way to review pull requests.*

[Try it out!](http://kegsay.github.io/github-pull-review/#/repos/kegsay/matrix-neb/8/diffs)

Github's UI for reviewing pull requests isn't great. You can't:
 * Do live code edits to code snippets
 * Mark review comments as "done" (and see a list of comments which are done/not done)
 * Have comment threading
 * Merge the PR by squashing commits
 * See "sensible" diffs when one PR is dependent on another PR (so you really only want to see the diff between the PRs rather than `base`)
 * Have intelligent diffs (e.g. word diffing vs line diffing to pick up adding a word then putting excess on new lines to meet line lengths)
 * Easily see an overview of the PRs *which require your attention* (rather than assigned/created/mentioned).
 * See outstanding commits on the `base` branch which are not merged into the PR currently
 * Map comment resolution to specific commits (any old commit which alters the file just marks the comment as "outdated")
 
This project aims to fix these issues, whilst maintaining the familiarity, look and feel of the existing pull request system. To that end, this project makes heavy use of the Github API, rather than rolling its own system for tracking pull requests and comments. That being said, there are desirable features which simply cannot be done using Github's API alone. For these features, there is [another project](https://github.com/illicitonion/gitrust) which supplies the required backend.

This is all also hosted on [Github pages](http://kegsay.github.io/github-pull-review/) but you can also `git clone` this repo and run it locally.

## Difference between GPR and Github's UI

Currently, GPR does the following over and above Github's UI:
 - Show a list of "Actions" that need to be done. An action is a series of comments on the same line. It is marked as "done" when the final comment starts with "done".
 - Provides buttons along with each line comment to see "this file *when* this comment was made" and "this file *after* this comment was made"
 - Show line comments that were made on this file several commits ago (Github doesn't show these at all, GPR gates them behind "Show all comments")
 - Supports merging PRs by squashing commits (requires [gitrust](https://github.com/illicitonion/gitrust))
 - See a summary of PRs which *require your attention*.
 
GPR doesn't currently do the following things Github's UI does:
 - Provide syntax highlighting on code
 - Provide an "Activity stream" of comments and commits chronologically.
 - Show *commit* comments.
 - Allows expanding of files beyond the diff hunk.

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

Some functionality (notably: history rewriting, squash merging, and oauth) is backed by a server whose code lives at https://github.com/illicitonion/gitrust - there is one of these running at https://review.rocks which you can point your server at for most functionality, but supporting OAuth flows will require you to run your own, with your own github oauth client secret.
