# Github Pull Review
*A better way to review pull requests.*

[Try it out!](http://kegsay.github.io/github-pull-review/)

Github's UI for reviewing pull requests isn't great. You can't:
 * Do live code edits to code snippets
 * Mark review comments as "done" (and see a summary comments which are done/not done)
 * Have comment threading (heaven forbid there are >1 distinct issues on a line of code!)
 * Tie comment resolution to commits (any old commit which alters the file just marks the comment as "outdated")
 
This project aims to fix these issues, whilst maintaining the familiarity, look and feel of the existing pull request system. To that end, this project makes heavy use of the Github API, rather than rolling its own system for tracking pull requests and comments.

This is all also hosted on [Github pages](http://kegsay.github.io/github-pull-review/) but you can also `git clone` this repo and run it locally.

## Building locally
First, `git clone` this repo. Then:

```
 $ npm install
 $ npm run build
```

Finally, host the `build` directory.

*The* `build` *directory is actually a submodule pointing to* `gh-pages`.
