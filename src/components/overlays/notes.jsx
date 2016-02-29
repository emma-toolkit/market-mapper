import React from 'react'
import throttle from 'lodash.throttle'
const createClass = React.createClass;

export default createClass({
  getInitialState() {
    return {dragging: null}
  },
  componentDidMount() {
    // console.log('HEY!');
    // const onMouseMove = throttle(e => {
    //   console.log('o');
    //   // console.log(e.offsetX, e.offsetY);
    // });
    window.onmousemove = () => console.log('yo!');
  },
  getHandleMouseDown(id) {
    return () => this.setState({dragging: id});
  },
  handleMouseUp() {
    this.setState({dragging: null});
  },
  handleMouseMove(e) {
    console.log(e);
  },
  getNotes() {
    return this.props.notes.toArray().map(note => {
      return (
        <div
          key={note.get('id')}
          className='note'
          style={{top: note.get('x'), left: note.get('y')}}
          onMouseDown={this.getHandleMouseDown(note.get('id'))}
          onMouseUp={this.handleMouseUp}
        >
          {note.get('text')}
        </div>
      );
    });
  },
  render() {
    return (
      <div className='overlay'>
        {this.getNotes()}
      </div>
    );
  }
});
