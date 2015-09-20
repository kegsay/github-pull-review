var dispatcher = require("../logic/dispatcher");

module.exports = React.createClass({displayName: 'PullRequestOverview',

    componentDidMount: function() {
        this._dispatcherRef = dispatcher.register(this.onAction);
    },

    componentWillUnmount: function() {
        dispatcher.unregister(this._dispatcherRef);
    },

    onAction: function(payload) {
        switch (payload.action) {
            case "view_pr":
                this.setState({
                    view_pr: payload.data
                });
                break;
        }
    },

    getInitialState: function() {
        return {
            view_pr: {}
        };
    },

    render: function() {
        return (
            <div>
                Overview {this.state.view_pr.request_id}
            </div>
        );
    }
});
