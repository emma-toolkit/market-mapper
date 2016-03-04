import React from 'react'
import throttle from 'lodash.throttle'
import config from '../../config.json'
const createClass = React.createClass;

export default createClass({
  getInitialState() {
    return {x: null, y: null, last_render: Date.now()};
  },

  componentDidUpdate() {
    if (this.unrendered) {
      this.setState({last_render: Date.now()});
    }
    if (!this.props.dragging && window.onmousemove !== null) return;
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
      this.setState(this.denormalize({
        x: this.props.notes.getIn([id, 'x']),
        y: this.props.notes.getIn([id, 'y'])
      }));
      this.props.startDragging(id);
    }
  },
  
  handleMouseUp() {
    const dragged = this.props.notes.get(this.props.dragging);
    const denormalized = this.denormalize({
      x: dragged.get('x'),
      y: dragged.get('y')
    });
    const clicked = denormalized.x === this.state.x &&
      denormalized.y === this.state.y;
    this.props.endDragging(this.props.dragging, this.normalize(this.state));
    if (clicked) {
      this.props.selectNote(dragged);
    }
  },

  getNotes() {
    this.unrendered = false;
    return this.props.notes.toArray().map(note => {
      const id = note.get('id');
      const classes = ['note'];
      let position;
      let offset;
      if (!this.refs[id]) {
        this.unrendered = true;
        offset = {
          x: 10000,
          y: 10000
        };
      } else {
        offset = {
          x: this.refs[id].offsetWidth / 2,
          y: this.refs[id].offsetHeight / 2
        };
      }
      if (this.props.dragging === id) {
        classes.push('grabbed');
        position = {
          top: this.state.y - offset.y,
          left: this.state.x - offset.x
        };
      } else {
        const denormalized = this.denormalize({
          x: note.get('x'),
          y: note.get('y')
        });
        position = {
          top: denormalized.y - offset.y,
          left: denormalized.x - offset.x
        };
      }
      if (this.props.selected && this.props.selected.get('id') === id) {
        classes.push('selected');
      }
      return (
        <div
          key={id}
          ref={id}
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

  normalize(position) {
    return {
      x: position.x * config.layout.w / this.refs.div.offsetWidth,
      y: position.y * config.layout.h / this.refs.div.offsetHeight
    };
  },

  denormalize(position) {
    return {
      x: position.x * this.refs.div.offsetWidth / config.layout.w,
      y: position.y * this.refs.div.offsetHeight / config.layout.h
    };
  },

  render() {
    return (
      <div className='overlay' onMouseUp={this.handleMouseUp} ref='div'>
        {this.getNotes()}
      </div>
    );
  }
});
