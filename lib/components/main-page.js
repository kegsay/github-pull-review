var InfoGetter = require("./info-getter");
var PullRequestOverview = require("./pull-request-overview");

module.exports = React.createClass({displayName: 'MainPage',

    render: function() {
        return (
            <div>
                <InfoGetter />
                <PullRequestOverview />
            </div>
        );
    }
});
