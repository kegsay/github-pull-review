var InfoGetter = require("./info-getter");

module.exports = React.createClass({displayName: 'MainPage',
    render: function() {
        return React.createElement("div", null,
            React.createElement(InfoGetter)
        );
    }
});
