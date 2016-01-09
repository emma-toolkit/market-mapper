import React from 'react'
import Cytoscape from 'cytoscape'
import Dagre from 'dagre'
import CytoscapeDagre from 'cytoscape-dagre'
import debounce from 'lodash.debounce'
// import Promise from 'bluebird'
import graph_style from '../styles/graph.styl'

CytoscapeDagre(Cytoscape, Dagre);

export default class Graph extends React.Component {
  constructor(props) {super(props)}

  shouldComponentUpdate(next_props) {
    if (next_props.state.getIn(['app', 'last_layout']) !==
      this.props.state.getIn(['app', 'last_layout']))
      this.doLayout();
    return next_props.state.getIn(['app', 'last_load']) !==
      this.props.state.getIn(['app', 'last_load']);
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
      classes: 'parent'
    },{
      group: 'nodes',
      data: {id: 'chain'},
      classes: 'parent'
    },{
      group: 'nodes',
      data: {id: 'infrastructure'},
      classes: 'parent'
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
      panningEnabled: false
    });
    this.graph.nodes().on('free', debounce(e => this.props.layoutDone()));
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
    if (environment.nonempty()) {
      environment.layout({
        name: 'grid',
        boundingBox: {
          x1: 0,
          y1: 0,
          x2: this.refs.div.offsetWidth,
          y2: this.one_third - this.margin
        }
      });
    }

    // Layout chain
    const chain = this.graph.elements('.chain');
    if (chain.nonempty()) {
      chain.layout({
        name: 'dagre',
        rankDir: 'LR'
      });
      chain.layout({
        name: 'dagre',
        rankDir: 'LR',
        boundingBox: this.getBoundingBox(chain, {
          top: this.one_third,
          right: this.margin,
          bottom: this.one_third,
          left: this.margin
        })
      });
    }

    // Layout infrastructure
    if (infrastructure.nonempty()) {
      infrastructure.layout({
        name: 'grid',
        boundingBox: {
          x1: 0,
          y1: this.one_third * 2 + this.margin,
          x2: this.refs.div.offsetWidth,
          y2: this.refs.div.offsetHeight
        }
      });
    }
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

  pushNodes(type, arr) {
    this.pushElements('nodes', type, this.convertNode, arr);
  }

  pushEdges(type, arr) {
    this.pushElements('edges', type, this.convertEdge, arr);
  }

  pushElements(element, type, converter, arr) {
    this.props.state.getIn([element, type]).forEach((record, id) =>
      arr.push(converter(record, id, type))
    );
  }

  convertNode(record, id, type) {
    const classes = [type];
    const position = record.get('position');
    if (position !== null)
      classes.push(position);
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
        parent: type,
        label: record.get('label')
      },
      classes: classes.join(' ')
    };
  }

  convertEdge(record, id, type) {
    return {
      group: 'edges',
      data: {
        id,
        source: record.get('in'),
        target: record.get('out')
      },
      classes: type
    };
  }

  render() {
    return <div id='graph' ref='div' />;
  }
}
