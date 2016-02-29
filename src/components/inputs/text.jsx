import React from 'react'
const createClass = React.createClass;

export default createClass({
  getDefaultProps() {
    return {is_textarea: false};
  },
  handleChange(e) {
    this.props.setAttribute(this.props.attribute, e.target.value);
  },
  handleKeyPress(e) {
    if (e.key === 'Enter') {
      if (!this.props.is_textarea || e.shiftKey) {
        e.target.blur();
      }
    }
  },
  renderTextInput() {
    return (
      <input
        type='text'
        className='controls-input'
        placeholder={this.props.placeholder}
        value={this.props.value}
        onChange={this.handleChange}
        onKeyPress={this.handleKeyPress}
      />
    );
  },
  renderTextArea() {
    return (
      <textarea
        className='controls-input'
        placeholder={this.props.placeholder}
        value={this.props.value}
        onChange={this.handleChange}
        onKeyPress={this.handleKeyPress}
      />
    );
  },
  render() {
    return this.props.is_textarea ?
      this.renderTextArea() : this.renderTextInput();
  }
});
