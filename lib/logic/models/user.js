"use strict";
var React = require("react");

function User(name, avatar, user_url) {
    this.url = user_url;
    this.name = name;
    this.avatar = avatar;
}

User.prototype.getAvatarUrl = function() {
    return this.avatar;
};

User.prototype.getUserLinkJsx = function(key) {
    if (key) {
        return (
            <a href={this.url} target="_blank" key={key}>{this.name}</a>
        );
    }

    return (
        <a href={this.url} target="_blank">{this.name}</a>
    );
};

module.exports = User;
