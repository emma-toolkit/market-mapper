import React from 'react'

export default class ToolTip extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className='tooltip'>
        <span className='tooltip-text'>
          {this.props.children}
        </span>
      </div>
    );
  }
}