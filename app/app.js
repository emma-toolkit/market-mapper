/** Quick and dirty display of sample data. */

import D3 from 'd3'
import data from '../dev/data.json'

let nodes, elements;
nodes = elements = {
  environment: [],
  chain: [],
  infrastructure: []
}
for (let id in data) {
  let node = data[id];
  nodes[node.type].push(node);
}

document.body.style.height = `${window.innerHeight}px`;
appendContainer('environment');
appendContainer('chain');
appendContainer('infrastructure');

elements.environment = D3.select('#environment').selectAll('div')
  .data(nodes.environment)
  .enter().append('div')
  .attr('class', 'node')
  .text(d => d.name);
elements.chain = D3.select('#chain').selectAll('div')
  .data(nodes.chain)
  .enter().append('div')
  .attr('class', 'node')
  .text(d => d.name);
elements.infrastructure = D3.select('#infrastructure').selectAll('div')
  .data(nodes.infrastructure)
  .enter().append('div')
  .attr('class', 'node')
  .text(d => d.name);

elements.chain.each(function(d) {
  d.x = this.offsetLeft;
  d.y = this.offsetTop;
  console.log(d);
});

function appendContainer(id) {
  let div = document.createElement('DIV');
  div.id = id;
  document.body.appendChild(div);
}
