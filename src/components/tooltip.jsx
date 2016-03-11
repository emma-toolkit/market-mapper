import React from 'react'

export default class ToolTip extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const dir = this.props.direction || 'right';
    return (
      <div className='tooltip'>
        <span className={'tooltip-text '+dir}>
          {this.props.children}
        </span>
      </div>
    );
  }
}