import React from 'react'
const createClass = React.createClass;

export default createClass({
  getColors() {
    const colors = [];
    this.props.legend.forEach((label, color) => {
      colors.push(
        <tr key={color}>
          <td>
            <div className='legend-swatch' style={{backgroundColor: color}} />
          </td>
          <td>{label}</td>
        </tr>
      );
    });
    return colors;
  },

  render() {
    return (
      <div id='legend'>
        <table>
          <tbody>
            <tr>
              <td className='legend-disruption'>/</td>
              <td>Partial disruption</td>
            </tr>
            <tr>
              <td className='legend-disruption'>X</td>
              <td>Major disruption</td>
            </tr>
            <tr>
              <td className='legend-disruption'>!</td>
              <td>Critical disruption</td>
            </tr>
            {this.getColors()}
          </tbody>
        </table>
      </div>
    );
  }
});
