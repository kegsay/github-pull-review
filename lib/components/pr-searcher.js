var React = require("react");

module.exports = React.createClass({displayName: "PrSearcher",
    getInitialState: function() {
        return {
            error: ""
        };
    },

    propTypes: {
        controller: React.PropTypes.any.isRequired
    },

    lookupPr: function(event) {
        if (event.charCode === /*Enter*/13) {
            var pr = this.props.controller.guessPr(event.target.value);
            if (pr) {
                this.props.history.pushState(null, `/repos/${pr.getRepo()}/${pr.getId()}/history`);
            }
            else {
                this.setState({error: "Could not find PR"});
            }
        }
    },

    handleChange: function(event) {
        var newVal = event.target.value;
        var changeState = {};
        changeState[event.target.id] = newVal;
        this.setState(changeState);
        switch (event.target.id) {
            case KEY_TOKEN:
                this.props.onUpdateToken(newVal);
                break;
            default:
                break;
        }
    },

    render: function() {
        var errorComponent = "";
        if (this.state.error) {
            errorComponent = <div>{this.state.error}</div>;
        }

        return (
            <div>
                Look up a PR: <input type="text" onKeyPress={this.lookupPr} />
                {errorComponent}
            </div>
        );
    }
});
