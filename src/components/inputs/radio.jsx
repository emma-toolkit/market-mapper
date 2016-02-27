import React from 'react'
const createClass = React.createClass;

export default createClass({
  handleChange(e) {
    this.props.setAttribute(this.props.attribute, e.target.value);
  },
  render() {
    return (
      <fieldset className='controls-input'>
        {Object.keys(this.props.options).map((key) => {
          return (
            <label key={key} className='controls-radio'>
              <input
                type='radio'
                name={this.props.attribute}
                value={key}
                checked={key === this.props.value.toString()}
                onChange={this.handleChange}
              />
              {this.props.options[key]}
            </label>
          );
        })}
      </fieldset>
    );
  }
});
