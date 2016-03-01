import React from 'react'
import throttle from 'lodash.throttle'
const createClass = React.createClass;

export default createClass({
  getInitialState() {
    return {x: null, y: null};
  },
  componentDidUpdate() {
    const box = this.refs.div.getBoundingClientRect();
    const onMouseMove = this.props.dragging ?
      throttle(e => {
        const x = e.pageX - box.left;
        const y = e.pageY - box.top;
        this.setState({x, y})
      }) :
      null;
    window.onmousemove = onMouseMove;
  },
  getHandleMouseDown(id) {
    return () => {
      this.setState({
        x: this.props.notes.getIn([id, 'x']),
        y: this.props.notes.getIn([id, 'y'])
      });
      this.props.startDragging(id);
    }
  },
  
  handleMouseUp() {
    const dragged = this.props.notes.get(this.props.dragging);
    const clicked = dragged.get('x') === this.state.x &&
      dragged.get('y') === this.state.y;
    this.props.endDragging(this.props.dragging, this.state);
    if (clicked) {
      this.props.selectNote(dragged);
    }
  },

  getNotes() {
    return this.props.notes.toArray().map(note => {
      const id = note.get('id');
      const classes = ['note'];
      let position;
      if (this.props.dragging === id) {
        classes.push('grabbed');
        position = {
          top: this.state.y,
          left: this.state.x
        };
      } else {
        position = {top: note.get('y'), left: note.get('x')};
      }
      if (this.props.selected && this.props.selected.get('id') === id) {
        classes.push('selected');
      }
      return (
        <div
          key={id}
          className={classes.join(' ')}
          style={position}
          onMouseDown={this.getHandleMouseDown(id)}
        >
          {note.get('text').split("\n").map((line, i) => {
            return <p key={i}>{line}</p>;
          })}
        </div>
      );
    });
  },
  render() {
    return (
      <div className='overlay' onMouseUp={this.handleMouseUp} ref='div'>
        {this.getNotes()}
      </div>
    );
  }
});
