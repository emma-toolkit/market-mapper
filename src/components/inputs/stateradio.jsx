import React from 'react'
const createClass = React.createClass;

export default createClass({
  getInitialState() {
    return {editing: null}
  },
  componentDidUpdate() {
    if (this.refs.input) {
      this.refs.input.focus();
    }
  },
  handleChange(e) {
    this.props.setState(parseInt(e.target.value));
  },
  handleKeyDown(e) {
    if (e.key === 'Escape') {
      this.setState({editing: null});
    }
  },
  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.props.setStateName(this.state.editing, this.refs.input.value);
    }
  },
  getClickHandler(key) {
    return () => this.setState({editing: key});
  },
  getEditableLabel(key) {
    if (this.state.editing === key) {
      return (
        <input
          ref='input'
          onKeyDown={this.handleKeyDown}
          onKeyPress={this.handleKeyPress}
        />
      );
    } else {
      return (
        <div onClick={this.getClickHandler(key)}>
          {this.props.options[key]}
        </div>
      );
    }
  },
  render() {
    return (
      <fieldset className='controls-input'>
        {Object.keys(this.props.options).map((key) => {
          return (
            <div
              key={key}
              className='controls-editable-radio'
            >
              <input
                type='radio'
                name={this.props.attribute}
                value={key}
                checked={key === this.props.value.toString()}
                onChange={this.handleChange}
              />
              <div className='controls-editable-radio-label'>
                {this.getEditableLabel(key)}
              </div>
            </div>
          );
        })}
      </fieldset>
    );
  }
});
