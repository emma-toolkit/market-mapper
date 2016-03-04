import React from "react";

export default class Icon extends React.Component {
  render() {
    const props = this.props;
    const color = props.color;
    const styles = color ? {fill: color} : null;
    const svg = require(`icons/${props.name}.svg`);

    return (
      <span className='icon' dangerouslySetInnerHTML={{__html: svg}}/>
    )
  }
}