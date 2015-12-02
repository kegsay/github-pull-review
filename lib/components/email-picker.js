import {EmailAddressesTrigger} from "../logic/triggers";
var React = require("react");

var TriggerMixin = require("../logic/triggers").TriggerMixin([EmailAddressesTrigger]);

module.exports = React.createClass({displayName: "EmailPicker",
    mixins: [TriggerMixin],

    getInitialState: function() {
        return {
            lastEmail: null
        }
    },

    propTypes: {
        controller: React.PropTypes.any.isRequired,
        onSelect: React.PropTypes.func.isRequired
    },

    componentDidMount: function() {
        this.setTrigger(new EmailAddressesTrigger());
        this.props.controller.getEmailAddresses();
    },

    onChange: function(event) {
        this.props.onSelect(event.target.value);
    },

    componentDidUpdate: function() {
        var some;
        var emails = this.getTrigger(EmailAddressesTrigger).emailAddresses;
        if (!emails) {
            return;
        }
        for (var i = 0; i < emails.length; ++i) {
            if (!emails[i].verified) {
                continue;
            }
            if (emails[i].primary) {
                if (this.state.lastEmail !== emails[i].email) {
                    this.setState({lastEmail: emails[i].email});
                    this.props.onSelect(emails[i].email);
                }
                return;
            }
            if (!some) {
                some = emails[i].email;
            }
        }
        if (this.state.lastEmail !== some) {
            this.props.onSelect(some);
        }
    },

    render: function() {
        var emails = this.getTrigger(EmailAddressesTrigger).emailAddresses;
        if (!emails) {
            return <span></span>;
        }

        var options = [];
        var defaultValue;
        for (var i = 0; i < emails.length; ++i) {
            var email = emails[i];
            if (email.verified) {
                options.push(<option value={email.email} key={`email-${i}`}>{email.email}</option>);
                if (email.primary) {
                    defaultValue = email.email;
                }
            }
        }
        return <select defaultValue={defaultValue} onChange={this.onChange}>{options}</select>;
    }
});
