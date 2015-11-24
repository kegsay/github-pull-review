const MERGABLE_PR = {
    user: "someone",
    repo: "some-repo",
    id: 1,
    pullPage: {
        html_url: "https://github.com/matrix-org/someone/some-repo/1",
        number: 1,
        state: "open",
        title: "PR title",
        user: {
            login: "someone",
            avatar_url: "https://avatars.githubusercontent.com/u/1131704?v=3",
            html_url: "https://github.com/someone"
        },
        body: "",
        head: {
            label: "someone:headbranch",
            ref: "headbranch",
            sha: "c00abe9f2faa80f6cfcf7fba028de870eca676ac",
            repo: {
                repo: {
                    clone_url: "https://github.com/someone/some-repo.git"
                }
            },
            user: {
                login: "someone"
            }
        },
        base: {
            label: "someone:master",
            ref: "master",
            sha: "68bec3a61a0f3a2b41d2dd2986eeb29af669e5fa",
            repo: {
                clone_url: "https://github.com/someone/some-repo.git"
            },
            user: {
                login: "someone"
            }
        },
        merged: false,
        mergeable: true,
        mergeable_state: "clean",
        merged_by: null
    },
    commentsPage: [],
    commitsPage: [],
    mergePage: {
        sha: "abc123",
        message: "Success"
    }
};

const SOME_USER = {
};

module.exports = {
    MERGABLE_PR: MERGABLE_PR,
    SOME_USER: SOME_USER
};
