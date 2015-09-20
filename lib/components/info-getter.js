var dispatcher = require("../logic/dispatcher");
var SessionStore = require("../logic/session-store");
var KEY_TOKEN = "info_access_token";
var KEY_REPO = "info_repo_id";
var KEY_REQ = "info_req_id";

module.exports = React.createClass({displayName: 'InfoGetter',

    getDefaultProps: function() {
        return {
            store: new SessionStore(localStorage)
        };
    },

    getInitialState: function() {
        var initialState = {};
        initialState[KEY_TOKEN] = this.props.store.getAccessToken();
        initialState[KEY_REPO] = this.props.store.getRepositoryId();
        initialState[KEY_REQ] = this.props.store.getRequestId();
        return initialState;
    },

    handleChange: function(event) {
        var newVal = event.target.value;
        var changeState = {};
        changeState[event.target.id] = newVal;
        this.setState(changeState);
        switch (event.target.id) {
            case KEY_REPO:
                this.props.store.setRepositoryId(newVal);
                break;
            case KEY_REQ:
                this.props.store.setRequestId(newVal);
                break;
            case KEY_TOKEN:
                this.props.store.setAccessToken(newVal);
                break;
        }
    },

    onView: function() {
        dispatcher.dispatch({
            action: "view_pr",
            data: {
                repo_id: this.state[KEY_REPO],
                request_id: this.state[KEY_REQ]
            }
        });
    },

    render: function() {
        return (
            <div>
                <input type="text" placeholder="access_token"
                id={KEY_TOKEN} value={this.state[KEY_TOKEN]}
                onChange={this.handleChange} />

                <div>
                    <input type="text" placeholder="owner/repo"
                    id={KEY_REPO} value={this.state[KEY_REPO]}
                    onChange={this.handleChange} />

                    <input type="text" placeholder="Pull Request #"
                    id={KEY_REQ} value={this.state[KEY_REQ]}
                    onChange={this.handleChange} />

                    <button onClick={this.onView}>View</button>
                </div>
            </div>
        );
    }
});
