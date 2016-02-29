import React from 'react'
const createClass = React.createClass;

export default createClass({
  handleChange(e) {
    this.props.setAttribute(this.props.attribute, e.target.value);
  },
  render() {
    return (
      <fieldset className='form-radio-group'>
        {Object.keys(this.props.options).map((key) => {
          return (
            <label key={key} className='form-radio-item'>
              <input
                type='radio'
                name={this.props.attribute}
                value={key}
                checked={key === this.props.value}
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
