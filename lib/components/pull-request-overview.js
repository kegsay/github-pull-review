var ActionMixin = require("../logic/actions").ActionMixin([
    "view_pr"
]);

module.exports = React.createClass({displayName: 'PullRequestOverview',
    mixins: [ActionMixin],

    render: function() {
        return (
            <div>
                Overview {this.state.view_pr.request_id}
            </div>
        );
    }
});
