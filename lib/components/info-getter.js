module.exports = React.createClass({displayName: 'InfoGetter',

    getInitialState: function() {
        return {
            token: localStorage.getItem("access_token")
        };
    },

    handleChange: function(event) {
        this.setState({
            token: event.target.value
        });
        localStorage.setItem("access_token", event.target.value);
    },

    render: function() {
        var ele = React.createElement.bind(React);
        var token = this.state.token;
        return ele("div", null,
            ele("input", {
                type: "text", placeholder: "access_token",
                value: token, onChange: this.handleChange
            })
        );
    }
});
