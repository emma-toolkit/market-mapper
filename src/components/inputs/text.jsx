import React from 'react'
const createClass = React.createClass;

export default createClass({
  getDefaultProps() {
    return {is_textarea: false};
  },
  getInitialState() {return {
    value: this.props.value,
    last_value: this.props.value
  }},
  shouldComponentUpdate(next_props, next_state) {
    return next_props.value !== this.props.value ||
      next_state.value !== this.state.value;
  },
  componentDidUpdate() {
    if (this.state.last_value !== this.props.value) {
      this.setState({
        value: this.props.value,
        last_value: this.props.value
      });
    }
  },
  setValue(value) {
    this.props.setAttribute(this.props.attribute, this.state.value);
  },
  handleChange(e) {
    this.setState({value: e.target.value})
  },
  handleKeyPress(e) {
    if (e.key === 'Enter') {
      if (!this.props.is_textarea) {
        e.target.blur();
        this.setValue(this.state.value);
      } else if (e.shiftKey) {
        e.preventDefault();
        e.target.blur();
        this.setValue(this.state.value);
      }
    }
  },
  renderTextInput() {
    return (
      <input
        type='text'
        className='controls-input'
        value={this.state.value}
        onChange={this.handleChange}
        onKeyPress={this.handleKeyPress}
      />
    );
  },
  renderTextArea() {
    return (
      <textarea
        className='controls-input'
        value={this.state.value}
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
