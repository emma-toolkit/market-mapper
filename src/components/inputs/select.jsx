import React from 'react'
const createClass = React.createClass;

export default createClass({
  handleChange(e) {
    this.props.setAttribute(this.props.attribute, e.target.value);
  },
  render() {
    return (
      <div className='form-select-container'>
        <span className='select-down-arrow'/>
        <select
          value={this.props.value}
          onChange={this.handleChange}
        >
          {
            Object.keys(this.props.options).map((key) => {
              const value = this.props.options[key];
              return <option key={key} value={value}>{value}</option>;
            })
          }
        </select>
      </div>
    );
  }
});
