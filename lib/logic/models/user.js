"use strict";

function User(name, avatar, user_url) {
    this.url = user_url;
    this.name = name;
    this.avatar = avatar;
}

User.prototype.getAvatarUrl = function() {
    return this.avatar;
};

User.prototype.getUserLinkJsx = function() {
    return (
        <a href={this.url} target="_blank">{this.name}</a>
    );
};

module.exports = User;
