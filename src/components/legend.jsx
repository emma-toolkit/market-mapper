import React from 'react'
const createClass = React.createClass;

const DEFAULT_COLOR_LABEL = 'Color label';

export default createClass({
  getColors() {
    const colors = [];
    this.props.nodes.forEach(nodetype => {
      nodetype.forEach(node => {
        const color = node.get('color');
        if (colors.indexOf(color) === -1) {
          colors.push(color);
        }
      });
    });
    return colors.map(color => {
      const label = this.props.legend.has(color) ?
        this.props.legend.get(color) : DEFAULT_COLOR_LABEL;
      return (
        <tr key={color}>
          <td className='legend-swatch'>
            <div style={{backgroundColor: color}} />
          </td>
          <td className='legend-label'>{label}</td>
        </tr>
      );
    });
  },

  render() {
    return (
      <div id='legend'>
        <table>
          <tbody>
            <tr>
              <td className='legend-disruption'>/</td>
              <td className='legend-label'>Partial disruption</td>
            </tr>
            <tr>
              <td className='legend-disruption'>X</td>
              <td className='legend-label'>Major disruption</td>
            </tr>
            <tr>
              <td className='legend-disruption'>!</td>
              <td className='legend-label'>Critical disruption</td>
            </tr>
            {this.getColors()}
          </tbody>
        </table>
      </div>
    );
  }
});
