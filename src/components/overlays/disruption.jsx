import React from 'react'
import config from '../../config.json'
const createClass = React.createClass;

const x_offset = -10;
const y_offset = -10;

const DISRUPTION_SYMBOLS = {
  partial: '/',
  major: 'X',
  critical: '!'
}

export default createClass({
  componentDidUpdate() {
    [...document.getElementsByClassName('disruption')]
      .forEach(old => old.remove());

    this.props.disruptions.forEach(location => {
      const element = document.createElement('DIV');
      element.className = 'disruption';
      element.style.left = `${location.x + x_offset}px`;
      element.style.top = `${location.y + y_offset}px`;
      element.textContent = DISRUPTION_SYMBOLS[location.disruption];
      this.refs.div.appendChild(element);
    });
  },
  render() {
    return <div className='overlay' ref='div' />;
  }
});
