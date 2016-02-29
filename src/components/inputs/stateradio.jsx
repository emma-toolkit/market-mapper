import React from 'react'
const createClass = React.createClass;

export default createClass({
  handleChange(e) {
    this.props.setState(parseInt(e.target.value));
  },
  render() {
    return (
      <fieldset id='state-toggle'>
        {Object.keys(this.props.states).map((key) => {
          return (
            <label key={key}>
              <input
                type='radio'
                name='state'
                value={key}
                checked={key === this.props.state.toString()}
                onChange={this.handleChange}
              />
              {this.props.states[key]}
            </label>
          );
        })}
      </fieldset>
    );
  }
});
