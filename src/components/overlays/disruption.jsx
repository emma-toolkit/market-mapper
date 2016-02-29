import React from 'react'
import config from '../../config.json'
const createClass = React.createClass;

const x_offset = -10;
const y_offset = -10;

export default createClass({
  componentDidUpdate() {
    [...document.getElementsByClassName('disruption')]
      .forEach(old => old.remove());

    this.props.disruptions.forEach(location => {
      let char;
      switch (location.disruption) {
        case 'partial':
          char = '/';
          break;
        case 'major':
          char = 'X';
          break;
        case 'critical':
          char = '!';
          break;
      }

      const element = document.createElement('DIV');
      element.className = 'disruption';
      element.style.left = `${location.x + x_offset}px`;
      element.style.top = `${location.y + y_offset}px`;
      element.textContent = char;
      this.refs.div.appendChild(element);
    });
  },
  render() {
    return <div className='overlay' ref='div' />;
  }
});
