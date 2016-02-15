import React from 'react'
const createClass = React.createClass;

export default createClass({
  getInitialState() {return {
    value: '',
    last_value: ''
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
  handleChange(e) {this.setState({value: e.target.value})},
  handleKeyPress(e) {
    if (e.key === 'Enter') this.setValue(this.state.value);
  },
  render() {
    return <input
      type='text'
      value={this.state.value}
      onChange={this.handleChange}
      onKeyPress={this.handleKeyPress}
    />
  }
});
