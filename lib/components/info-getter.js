var ID_ACCESS_TOKEN = "info_access_token";
var ID_OWNER_REPO = "info_owner_repo";
var ID_PR_NUM = "info_pr_num";

var IDS = [
    ID_ACCESS_TOKEN, ID_PR_NUM, ID_OWNER_REPO
];

module.exports = React.createClass({displayName: 'InfoGetter',

    getInitialState: function() {
        var initial = {};
        IDS.forEach(function(id) {
            initial[id] = localStorage.getItem(id);
        });
        return initial;
    },

    handleChange: function(event) {
        var changeState = {};
        changeState[event.target.id] = event.target.value;
        this.setState(changeState);
        localStorage.setItem(event.target.id, event.target.value);
    },

    render: function() {
        var ele = React.createElement.bind(React);
        var token = this.state.token;
        return (
            <div>
                <input type="text" placeholder="access_token"
                id={ID_ACCESS_TOKEN} value={this.state[ID_ACCESS_TOKEN]}
                onChange={this.handleChange} />

                <div>
                    <input type="text" placeholder="owner/repo"
                    id={ID_OWNER_REPO} value={this.state[ID_OWNER_REPO]}
                    onChange={this.handleChange} />

                    <input type="text" placeholder="Pull Request #"
                    id={ID_PR_NUM} value={this.state[ID_PR_NUM]}
                    onChange={this.handleChange} />

                    <button>View</button>
                </div>
            </div>
        );
    }
});
