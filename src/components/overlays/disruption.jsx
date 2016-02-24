import React from 'react'
const createClass = React.createClass;

export default createClass({
  componentDidUpdate() {
    // [...document.getElementsByClassName('disruption')]
    //   .forEach(old => old.remove());

    // this.props.state.get('nodes').forEach(nodetype => {
    //   nodetype.forEach(node => {
    //     const disruption = node.get('disruption');
    //     if (disruption) {
    //       let char;
    //       switch (disruption) {
    //         case 'partial':
    //           char = '/';
    //           break;
    //         case 'major':
    //           char = 'X';
    //           break;
    //         case 'critical':
    //           char = '!';
    //           break;
    //       }
    //       console.log(this.refs.div.offsetWidth, this.refs.div.offsetHeight);
    //       const element = document.createElement('DIV');
    //       element.className = 'disruption';
    //       element.style.bottom = `${node.get('y') *
    //         this.refs.div.offsetHeight / config.layout.h}px`;
    //       element.style.right = `${node.get('x') *
    //         this.refs.div.offsetWidth / config.layout.w}px`;
    //       element.textContent = char;
    //       this.refs.div.appendChild(element);
    //     }
    //   });
    // });
  },
  render() {
    return (
      <div id='disruption-overlay'>
      </div>
    );
  }
});
