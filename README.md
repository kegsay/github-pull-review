# Github Pull Review
*A better way to review pull requests.*

Github's UI for reviewing pull requests isn't great. You can't:
 * Do live code edits to code snippets
 * Mark review comments as "done" (and see a summary comments which are done/not done)
 * Have comment threading (heaven forbid there are >1 distinct issues on a line of code!)
 * Tie comment resolution to commits (any old commit which alters the file just marks the comment as "outdated")
 
This project aims to fix these issues, whilst maintaining the familiarity, look and feel of the existing pull request system. To that end, this project makes heavy use of the Github API, rather than rolling its own system for tracking pull requests and comments.

# Install
```
$ git clone https://github.com/Kegsay/github-pull-review.git
$ npm install
$ npm start
```

Then navigate to `http://localhost:7777`

# Usage

## Getting an access token

## Doing pull reviews
