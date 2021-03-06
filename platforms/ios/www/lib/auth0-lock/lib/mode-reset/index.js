/**
 * Module dependencies.
 */

var _ = require('underscore');
var $ = require('../bonzo-augmented');
var Emitter = require('events').EventEmitter;
var create = require('../object-create');
var stop = require('../stop-event');
var bind = require('../bind');
var template = require('./reset.ejs');
var regex = require('../regex');
var empty = regex.empty;
var trim = require('trim');
var email_parser = regex.email_parser;

/**
 * Expose ResetPanel
 */

module.exports = ResetPanel;

/**
 * Create `ResetPanel`
 *
 * @param {Auth0Lock} widget
 * @param {Object} options
 * @constructor
 */

function ResetPanel(widget, options) {
  if (!(this instanceof ResetPanel)) {
    return new ResetPanel(widget, options);
  };

  // Both `widget` and `options` are required
  if (2 !== arguments.length) {
    throw new Error('Missing parameters for ResetPanel');
  }

  this.name = 'reset';
  this.widget = widget;
  this.options = this.resolveOptions(options);
  this.el = null;

  Emitter.call(this);
}

/**
 * Inherit from `EventEmitter`
 */

ResetPanel.prototype = create(Emitter.prototype);

/**
 * Query for elements at `this.el` context
 *
 * @param {String} selector
 * @return {BonzoAugmented}
 * @public
 */

ResetPanel.prototype.query = function(selector) {
  if (!this.el) throw new Error('Can\'t get element since no `el` is set to local context');
  return $(selector, this.el);
}

/**
 * Create `el`
 *
 * @param {Object} options
 * @return {NodeElement}
 * @public
 */

ResetPanel.prototype.create = function(options) {
  var opts = this.resolveOptions(options);
  var widget = this.widget;

  this.el = $.create(widget.render(template, opts))[0];
  this.bindAll();
  return this.el;
}

/**
 * Return `el` or create it
 *
 * @param {Object} options
 * @return {NodeElement}
 * @public
 */

ResetPanel.prototype.render = function() {
  return null != this.el
    ? this.el
    : this.create.apply(this, arguments);
}

/**
 * Resolves login options passed to template
 *
 * @param {Object} options
 * @return {Object}
 * @private
 */

ResetPanel.prototype.resolveOptions = function(options) {
  return _.extend({}, this.widget.options,  this.options, options);
}

/**
 * Bind events to `this.el`, like submit
 *
 * @return {ResetPanel}
 * @private
 */

ResetPanel.prototype.bindAll = function() {
  var options = this.options;

  // hide only and only if set to false
  this.query('.a0-options')
    .toggleClass('a0-hide', !options.showResetAction);

  this.query('form')
    .a0_off('submit')
    .a0_on('submit', bind(this.onsubmit, this));

  this.query('.a0-options .a0-cancel')
    .a0_on('click', bind(this.oncancel, this));

  return this;
}

ResetPanel.prototype.onsubmit = function(e) {
  stop(e);
  var username = this.query('.a0-email input').val();
  var password = this.query('.a0-password input').val();
  var connection  = this.options._getAuth0Connection();

  if (!valid(this)) return;
  submit(this, connection.name, username, password);
}

ResetPanel.prototype.oncancel = function(e) {
  stop(e);
  var widget = this.widget;
  widget._showSuccess();
  widget._showError();
  widget._focusError();
  widget._signinPanel();
}

/**
 * Private helpers
 */

/**
 * Validate form for errros
 */

function valid(panel) {
  var ok = true;
  var email_input = panel.query('input[name=email]');
  var email = trim(email_input.val());
  var email_empty = empty.test(email);
  var email_parsed = email_parser.exec(email.toLowerCase());
  var password_input = panel.query('input[name=password]');
  var password = password_input.val();
  var password_empty = empty.test(password);
  var repeat_password_input = panel.query('input[name=repeat_password]');
  var repeat_password = repeat_password_input.val();
  var repeat_password_empty = empty.test(repeat_password);
  var widget = panel.widget;

  // asume valid by default
  // and reset errors
  widget._showError();
  widget._focusError();

  if (email_empty) {
    widget._focusError(email_input);
    ok = false;
  }

  if (!email_parsed && !email_empty) {
    widget._focusError(email_input, widget.options.i18n.t('invalid'));
    ok = false;
  }

  if (password_empty) {
    widget._focusError(password_input);
    ok = false;
  };

  if (repeat_password_empty) {
    widget._focusError(repeat_password_input);
    ok = false;
  };

  if (repeat_password_input.val() !== password_input.val()) {
    widget._focusError(repeat_password_input, widget.options.i18n.t('mustMatch'));
    ok = false;
  };

  return ok;
}

function submit(panel, connectionName, username, password) {
  var widget = panel.widget;
  var email_input = panel.query('input[name=email]');

  widget._loadingPanel({ mode: 'reset' });

  widget.$auth0.changePassword({
    connection: connectionName,
    username:   username,
    password:   password
  }, function (err) {
    // I should here use the same instance of panel and re-render before showing errors!!

    // This is now dummy, and should no longer exist since all
    // dom events keep a reference to widget.$container
    if ( !widget.$container || widget.query()[0] !== widget.$container.childNodes[0] ) {
      return console && console.log && console.log('this password reset was triggered from another node instance', arguments);
    }

    panel.query('.a0-password input').val('');
    panel.query('.a0-repeatPassword input').val('');

    if (!err) {
      email_input.val('');
      widget._signinPanel(panel.options);
      return widget._showSuccess(widget.options.i18n.t('reset:successText'));
    }

    widget.setPanel(panel);

    if (400 === err.status) {
      widget._focusError(email_input);
      widget._showError(widget.options.i18n.t('reset:userDoesNotExistErrorText'));
    } else {
      widget._showError(widget.options.i18n.t('reset:serverErrorText'));
    }

  });

}
