import React from 'react'
const createClass = React.createClass;

export default createClass({
  handleChange(e) {
    this.props.setState(parseInt(e.target.value));
  },
  render() {
    return (
      <fieldset id='state-toggle'>
        {Array.from(this.props.states.keys()).map((key) => {
          return (
            <label key={key}>
              <input
                type='radio'
                name='state'
                value={key}
                checked={key === this.props.state}
                onChange={this.handleChange}
              />
              {this.props.states.get(key)}
            </label>
          );
        })}
      </fieldset>
    );
  }
});
