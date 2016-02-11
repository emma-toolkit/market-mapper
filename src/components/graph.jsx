import React from 'react'
import Cytoscape from 'cytoscape'
import Dagre from 'dagre'
import CytoscapeDagre from 'cytoscape-dagre'
import debounce from 'lodash.debounce'
import Promise from 'bluebird'
import graph_style from '../styles/graph.styl'

CytoscapeDagre(Cytoscape, Dagre);

const [W, H] = [4096, 2160];

export default class Graph extends React.Component {
  constructor(props) {super(props)}

  shouldComponentUpdate(next_props) {
    if (next_props.state.getIn(['app', 'last_layout']) !==
      this.props.state.getIn(['app', 'last_layout'])) {
      this.doLayout();
    }
    return next_props.state.getIn(['app', 'last_redraw']) !==
      this.props.state.getIn(['app', 'last_redraw']);
  }

  componentDidUpdate() {
    // Compute constants based on div
    this.margin = this.refs.div.offsetHeight / 10;
    this.one_third = this.refs.div.offsetHeight / 3;

    // Destroy existing graph instance
    if (this.graph !== undefined) this.graph.destroy();

    // Push parent nodes
    const elements = [{
      group: 'nodes',
      data: {id: 'environment'},
      classes: 'parent',
      selectable: false,
      locked: true,
      grabbable: false
    },{
      group: 'nodes',
      data: {id: 'chain'},
      classes: 'parent',
      selectable: false,
      locked: true,
      grabbable: false
    },{
      group: 'nodes',
      data: {id: 'infrastructure'},
      classes: 'parent',
      selectable: false,
      locked: true,
      grabbable: false
    }];

    // Push nodes and edges from state
    this.pushNodes('environment', elements);
    this.pushNodes('chain', elements);
    this.pushNodes('infrastructure', elements);
    this.pushEdges('chain', elements);
    this.pushEdges('infrastructure', elements);

    // Instantiate graph
    this.graph = Cytoscape({
      container: this.refs.div,
      elements: elements,
      layout: {name: 'preset'},
      style: graph_style.toString(),
      zoomingEnabled: false,
      panningEnabled: false,
      selectionType: 'single',
      boxSelectionEnabled: false
    });
    this.graph.on('mouseover', 'node', e => {
      if (this.graph.nodes(':selected').length > 0) {
        e.cyTarget.addClass('hover')
      }
    });
    this.graph.on('mouseout', 'node', e =>
      e.cyTarget.removeClass('hover')
    );
    this.graph.on('grab', 'node', () =>
      this.refs.div.classList.add('grabbed')
    );
    this.graph.on('free', 'node', debounce(e => {
      this.refs.div.classList.remove('grabbed')
      this.normalize(e.cyTarget);
    }));
    this.graph.on('select', 'node', e => {
      this.graph.nodes().not(e.cyTarget).unselect()
      this.props.inspectNode(e.cyTarget);
    });
    this.graph.on('unselect', 'node', () =>
      this.props.uninspectNode()
    );
  }

  doLayout() {
    // Layout chain and infrustructure together
    // in order to determine infrastructure order
    this.graph.elements('.chain, .infrastructure').layout({
      name: 'dagre',
      rankDir: 'LR'
    });
    const infrastructure = this.graph.nodes('.infrastructure').sort(
      (ele1, ele2) => ele1.position().y - ele2.position().y
    );

    // Layout environment
    const environment = this.graph.elements('.environment');
    const environment_done = new Promise(resolve => {
      environment.layout({
        name: 'grid',
        boundingBox: {
          x1: 0,
          y1: 0,
          x2: this.refs.div.offsetWidth,
          y2: this.one_third - this.margin,
        },
        ready: () => resolve(environment)
      });
    });

    // Layout chain
    const chain = this.graph.elements('.chain');
    const chain_done = new Promise(resolve => {
      chain.layout({
        name: 'dagre',
        rankDir: 'LR',
        ready: () => {
          let layout, bounding_box;
          if (chain.length > 1) {
            layout = 'dagre';
            bounding_box = this.getBoundingBox(chain, {
              top: this.one_third,
              right: this.margin,
              bottom: this.one_third,
              left: this.margin
            });
          } else {
            layout = 'grid';
            bounding_box = {
              x1: 0,
              y1: this.one_third - this.margin,
              x2: this.refs.div.offsetWidth,
              y2: this.one_third * 2 + this.margin
            };
          }
          chain.layout({
            name: layout,
            rankDir: 'LR',
            boundingBox: bounding_box,
            ready: () => resolve(chain)
          });
        }
      });
    });

    // Layout infrastructure
    const infrastructure_done = new Promise(resolve => {
      infrastructure.layout({
        name: 'grid',
        boundingBox: {
          x1: 0,
          y1: this.one_third * 2 + this.margin,
          x2: this.refs.div.offsetWidth,
          y2: this.refs.div.offsetHeight
        },
        ready: () => resolve(infrastructure)
      });
    });

    // Dispatch LAYOUT_DONE when all layouts are done
    Promise.reduce(
      [environment_done, chain_done, infrastructure_done],
      (nodes, domain_nodes) => nodes.union(domain_nodes),
      this.graph.collection()
    ).then(nodes => this.normalize(nodes));
  }

  hasNodes(domain) {
    return this.props.state.getIn(['nodes', domain]).size > 0;
  }

  getBoundingBox(nodes, margins) {
    const extremes = {
      top: null,
      right: null,
      bottom: null,
      left: null
    };
    nodes.forEach(node => {
      if (
        extremes.top === null ||
        node.position().y < extremes.top.position().y
      ) extremes.top = node;
      if (
        extremes.right === null ||
        node.position().x > extremes.right.position().x
      ) extremes.right = node;
      if (
        extremes.bottom === null ||
        node.position().y > extremes.bottom.position().y
      ) extremes.bottom = node;
      if (
        extremes.left === null ||
        node.position().x < extremes.left.position().x
      ) extremes.left = node;
    });
    return {
      x1: margins.left + extremes.left.outerWidth() / 2,
      y1: margins.top + extremes.top.outerHeight() / 2,
      x2: this.refs.div.offsetWidth -
        extremes.right.outerWidth() / 2 - margins.right,
      y2: this.refs.div.offsetHeight -
        extremes.bottom.outerHeight() / 2 - margins.bottom
    };
  }

  pushNodes(domain, arr) {
    this.pushElements('nodes', domain, this.convertNode, arr);
  }

  pushEdges(domain, arr) {
    this.pushElements('edges', domain, this.convertEdge, arr);
  }

  pushElements(element, domain, converter, arr) {
    this.props.state.getIn([element, domain]).forEach((record, id) => 
      arr.push(converter(record, id, domain, this))
    );
  }

  convertNode(record, id, domain, self) {
    const classes = [domain];
    const position = record.get('position');
    if (position !== null) classes.push(position);
    switch (record.get('disruption')) {
      case 1:
        classes.push('partial');
        break;
      case 2:
        classes.push('major');
        break;
      case 3:
        classes.push('critical');
    }
    return {
      group: 'nodes',
      data: {
        id,
        parent: domain,
        label: record.get('label')
      },
      position: {
        x: record.get('x') * self.refs.div.offsetWidth / W,
        y: record.get('y') * self.refs.div.offsetHeight / H
      },
      classes: classes.join(' ')
    };
  }

  convertEdge(record, id, domain) {
    return {
      group: 'edges',
      data: {
        id,
        source: record.get('in'),
        target: record.get('out')
      },
      classes: domain
    };
  }

  normalize(nodes) {
    const data = new Map();
    nodes.forEach(node => {
      const position = node.position();
      const x = position.x * W / this.refs.div.offsetWidth;
      const y = position.y * H / this.refs.div.offsetHeight;
      data.set(node.data().id, {x, y});
    });
    this.props.layoutDone(data);
  }

  render() {
    return <div id='graph' ref='div' />;
  }
}
