/* @flow */
import Action from "./action";
import Comment from "./comment";
import Commit from "./commit";
import LineComment from "./line-comment";
import Ref from "./ref";
import User from "./user";

class PullRequest {
    repo: string;
    id: string;
    link: ?string;
    title: ?string;
    body: ?string;
    state: ?string;
    src: ?Ref;
    dest: ?Ref;
    owner: ?User;
    assignee: ?User;
    merger: ?User;
    mergeable: boolean;
    commits: Array<Commit>;
    comments: Array<Comment>;
    lineComments: Array<LineComment>;
    commitLineComments: Array<LineComment>;
    actions: Array<Action>;

    constructor(repo: string, id: string) {
        this.repo = repo;
        this.id = id;
        this.link = null;
        this.title = null;
        this.body = null;
        this.state = null;
        this.src = null;
        this.dest = null;
        this.owner = null;
        this.assignee = null;
        this.merger = null;
        this.mergeable = false;
        this.commits = [];
        this.comments = [];
        this.lineComments = [];
        this.commitLineComments = [];
        this.actions = [];
    }

    setState(state: string) {
        if (["merged", "open", "closed"].indexOf(state) === -1) {
            throw new Error("setState: bad state => " + state);
        }
        this.state = state;
    }

    setLink(link: string) {
        this.link = link;
    }

    setTitle(title: string) {
        this.title = title;
    }

    setBody(body: string) {
        this.body = body;
    }

    setSource(src: Ref) {
        this.src = src;
    }

    setDest(dest: Ref) {
        this.dest = dest;
    }

    setOwner(user: User) {
        this.owner = user;
    }

    setAssignee(assignee: User) {
        this.assignee = assignee;
    }

    setMerger(merger: User) {
        this.merger = merger;
    }

    setMergeable(mergeable: boolean) {
        this.mergeable = mergeable;
    }

    setLineComments(lineComments: Array<LineComment>) {
        this.lineComments = lineComments;
        this.actions = Action.fromLineComments(lineComments);
    }

    setCommitLineComments(lineComments: Array<LineComment>) {
        this.commitLineComments = lineComments;
    }

    getRepo(): ?string {
        return this.repo;
    }

    getId(): string {
        return this.id;
    }

    getTitle(): ?string {
        return this.title;
    }

    getBody(): ?string {
        return this.body;
    }

    getLink(): ?string {
        return this.link;
    }

    getState(): ?string {
        return this.state;
    }

    getPrettyState(): ?string {
        let state = this.state;
        if (!state) { return null; }
        return state[0].toUpperCase() + state.substring(1);
    }

    getSource(): ?Ref {
        return this.src;
    }

    getDest(): ?Ref {
        return this.dest;
    }

    getOwner(): ?User {
        return this.owner;
    }

    getAssignee(): ?User {
        return this.assignee;
    }

    getMerger(): ?User {
        return this.merger;
    }

    getMergeable(): boolean {
        return this.mergeable;
    }

    getCommits(): Array<Commit> {
        return this.commits;
    }

    getComments(): Array<Comment> {
        return this.comments;
    }

    setComments(comments: Array<Comment>) {
        this.comments = comments;
    }

    setCommits(commits: Array<Commit>) {
        this.commits = commits;
    }

    getActions(): Array<Action> {
        return this.actions;
    }

    getDoneActions(): Array<Action> {
        return this.getActions().filter(function(a) {
            return a.isDone();
        });
    }

    getActionsToDo(): Array<Action> {
        return this.getActions().filter(function(a) {
            return !a.isDone();
        });
    }

    isLGTM(): boolean {
        var lastComment = this.getLastComment();
        if (!lastComment) {
            return false;
        }
        return lastComment.getBody().indexOf("LGTM") >= 0;
    }

    getLastComment(): ?Comment {
        if (this.getComments().length === 0) {
            return null;
        }
        return this.getComments()[this.getComments().length - 1];
    }

    getLastCommenter(): ?User {
        var lastComment = this.getLastComment();
        if (!lastComment) {
            return null;
        }
        return lastComment.getUser();
    }

    getLineComments(): Array<LineComment> {
        return this.lineComments.concat(this.commitLineComments);
    }
}

module.exports = PullRequest;
