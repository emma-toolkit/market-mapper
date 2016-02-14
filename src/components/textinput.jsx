import React from 'react'
const createClass = React.createClass;

export default createClass({
  getInitialState() {return {
    value: '',
    last_selected: ''
  }},
  shouldComponentUpdate(next_props, next_state) {
    return next_props.selected !== this.props.selected ||
      next_state.value !== this.props.value;
  },
  componentDidUpdate() {
    if (this.state.last_selected !== this.props.selected) {
      this.setState({
        value: this.props.selected,
        last_selected: this.props.selected
      });
    }
  },
  handleChange(e) {this.setState({value: e.target.value})},
  render() {
    return <input
      type='text'
      value={this.state.value}
      onChange={this.handleChange}
    />
  }
});
