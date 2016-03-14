import React from 'react'
const createClass = React.createClass;

export default createClass({
  handleClick(key) {
    this.props.setState(key);
  },
  render() {

    if (this.props.states.size === 1){
      return (<div/>);
    }
    return (
      <div id='state-toggle'>
        {Array.from(this.props.states.keys()).map((key) => {
          const active_class = key === this.props.state ? ' is-active' : ''
          return (
            <h3 className={'state-toggle-item'+active_class} key={key} onClick={this.handleClick.bind(null, key)}>
              {this.props.states.get(key) || 'unnamed state'}
            </h3>
          );
        })}
      </div>
    );
  }
});
