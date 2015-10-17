"use strict";
var React = require("react");
module.exports = React.createClass({displayName: 'CommitView',

    getInitialState: function() {
        return {
            isDescriptionVisible: false
        };
    },

    onDescClick: function() {
        this.setState({
            isDescriptionVisible: !this.state.isDescriptionVisible
        });
    },

    render: function() {
        var commit = this.props.commit;
        if (!commit) {
            return (
                <div>
                    No commit.
                </div>
            );
        }

        var desc, descToggleText, showHideButton;
        if (commit.getHtmlDescription()) {
            if (this.state.isDescriptionVisible) {
                descToggleText = "Hide";
                desc = (
                    <div className="CommitView_desc"
                        dangerouslySetInnerHTML={{
                            __html: commit.getHtmlDescription()
                        }}>
                    </div>
                );
            }
            else {
                descToggleText = "Show more"
            }

            showHideButton = (
                <button onClick={this.onDescClick} className="CommitView_showButton">
                    {descToggleText}
                </button>
            );
        }

        return (
            <div className="CommitView">
                <img className="CommitView_avatar" src={
                    commit.getUser().getAvatarUrl()
                } />
                <div className="CommitView_msg">
                    <span className="CommitView_title">
                        {commit.getTitle()}
                    </span>
                    {showHideButton}
                    {desc}
                </div>
                <div className="CommitView_meta">
                    {commit.getAuthorLinkJsx()} authored this {
                        commit.getTimeAgo()
                    } ago {commit.getShaLinkJsx()}
                </div>
            </div>
        );
    }
});
