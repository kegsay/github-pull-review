module.exports = React.createClass({displayName: 'MainPage',
    render: function() {
        return React.createElement("div", null, "MainPage ", this.props.name);
    }
});
