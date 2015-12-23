"use strict";
var React = require("react");
var Link = require("react-router").Link;

module.exports = React.createClass({displayName: 'GprHeader',
    propTypes: {
        showBackLink: React.PropTypes.bool
    },

    getDefaultProps: function() {
        return {
            showBackLink: false
        };
    },

    render: function() {
        var backLink;
        if (this.props.showBackLink) {
            backLink = (
                <div className="GprHeader_back">
                    <Link to={`/list`}>Back to List</Link>
                </div>
            );
        }

        return (
            <div className="GprHeader">
                {backLink}
                <div className="GprHeader_title">
                    Git Pull Review
                </div>
            </div>
        );
    }
});
