import React from 'react'
import Cytoscape from 'cytoscape'
import $ from 'jquery'
import Dagre from 'dagre'
import CytoscapeDagre from 'cytoscape-dagre'
import debounce from 'lodash.debounce'
import Promise from 'bluebird'
import layout from '../layout'
import config from '../config.json'
import graph_style from '../styles/graph.styl'

CytoscapeDagre(Cytoscape, Dagre);

export default class Graph extends React.Component {
  constructor(props) {super(props)}

  shouldComponentUpdate(next_props) {
    if (
      next_props.state.getIn(['app', 'selected']) === null &&
      this.props.state.getIn(['app', 'selected']) !== null
    ) {
      this.graph.elements(':selected').deselect();
    }

    if (
      next_props.state.getIn(['app', 'last_layout']) !==
      this.props.state.getIn(['app', 'last_layout'])
    ) {
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
    if (this.graph !== undefined) {
      this.graph.destroy();
    }

    // Push parent nodes
    const elements = [{
      group: 'nodes',
      data: {id: 'environment'},
      classes: 'parent',
      selectable: false,
      locked: true,
      grabbable: false
    }, {
      group: 'nodes',
      data: {id: 'chain'},
      classes: 'parent',
      selectable: false,
      locked: true,
      grabbable: false
    }, {
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

    const boundaries = {
      environment: layout['environment'] * this.refs.div.offsetHeight * 2 / config.layout.h,
      chain: layout['chain'] * this.refs.div.offsetHeight * (3/2) / config.layout.h,
      infrastructure: this.refs.div.offsetHeight
    };

    this.graph.on('mouseover', 'node', e => {
      const hovered = e.cyTarget;
      const nodetype = hovered.data('nodetype');
      if (hovered.isParent() || nodetype === 'environment') return;

      const connecting = this.props.getConnecting();
      if (connecting && nodetype === 'infrastructure') return;

      const position = hovered.renderedPosition();
      const bounding_box = hovered.renderedBoundingBox();
      if (connecting) {
        this.props.setInHandle(
          hovered.id(),
          position.x - bounding_box.w / 2,
          position.y
        );
      } else {
        this.props.setOutHandle(
          nodetype,
          hovered.id(),
          position.x + bounding_box.w / 2,
          position.y
        );
      }
    });
    this.graph.on('mouseout', 'node', e => {
      if (
        this.props.getOutHandle() !== null &&
        !this.props.getConnecting()
      ) {
        this.props.clearOutHandle();
      }

      if (this.props.getInHandle() !== null) {
        this.props.clearInHandle();
      }
    });
    this.graph.on('grab', 'node', () => {
      this.refs.div.classList.add('grabbed')
      this.props.clearOutHandle();
    });
    this.graph.on('free', 'node', debounce(e => {
      const classes = this.refs.div.classList;
      if (classes.contains('grabbed')) {
        classes.remove('grabbed');
        this.normalize(e.cyTarget);
      }
    }));
    this.graph.on('position', 'node', e => {
      const target = e.cyTarget;
      const nodetype = target.data('nodetype');
      let upper, lower;
      switch (nodetype) {
        case 'environment':
          upper = 0;
          lower = boundaries.environment;
          break;
        case 'chain':
          upper = boundaries.environment;
          lower = boundaries.chain;
          break;
        case 'infrastructure':
          upper = boundaries.chain;
          lower = boundaries.infrastructure;
          break;
      }
      const box = target.boundingBox();
      if (box.y1 < upper) {
        target.position('y', upper + box.h / 2);
      } else if (box.y2 > lower) {
        target.position('y', lower - box.h / 2);
      } else if (box.y1 === upper || box.y2 === lower) {
        return;
      }
    });
    this.graph.on('select', e => {
      this.props.selectElement(e.cyTarget);
    });
    this.graph.on('unselect', e => {
      this.props.deselectElement()
    });
    this.graph.on('click', 'node', e => {
      if (e.cyTarget.isParent()) {
        e.cy.elements(':selected').deselect();
      }
    });

    this.graph.ready(() => {
      const selected = this.props.getSelected();
      if (selected !== null && this.graph.elements(':selected').length === 0) {
        this.graph.elements(`#${selected.id}`).select();
      }
    });

    this.graph.onRender(() => {
      const disruptions = [];
      this.graph.elements().forEach(element => {
        const disruption = element.data('disruption');
        if (!disruption) return;

        const location = {disruption};
        const box = element.boundingBox();
        if (element.group() === 'nodes') {
          location.x = box.x2 - 15;
          location.y = box.y1 + 15;
        } else {
          location.x = (box.x1 + box.x2) / 2;
          location.y = (box.y1 + box.y2) / 2;
        }
        disruptions.push(location);
      });
      this.props.setDisruptions(disruptions);
    });
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
          if (
            chain.nodes().length >= 3 &&
            chain.edges().length >= 1
          ) {
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

    Promise.reduce(
      [environment_done, chain_done, infrastructure_done],
      (nodes, nodetype_nodes) => nodes.union(nodetype_nodes),
      this.graph.collection()
    ).then(nodes => this.normalize(nodes));
  }

  hasNodes(nodetype) {
    return this.props.state.getIn(['nodes', nodetype]).size > 0;
  }

  pushNodes(nodetype, arr) {
    this.pushElements('nodes', nodetype, this.convertNode, arr);
  }

  pushEdges(nodetype, arr) {
    this.pushElements('edges', nodetype, this.convertEdge, arr);
  }

  pushElements(element, nodetype, converter, arr) {
    this.props.state.getIn([element, nodetype]).forEach((record, id) =>
      arr.push(converter(record, id, nodetype, this))
    );
  }

  convertNode(record, id, nodetype, self) {
    const classes = [nodetype];
    if (!record.get('active')) {
      classes.push('inactive');
    }

    const position = record.get('position');
    if (position !== null) classes.push(position);

    const disruption = record.get('disruption');
    if (disruption !== '') classes.push(disruption);

    const data = record.toObject();
    data.parent = data.nodetype;

    data.label = record.get('name') || record.get('subtype') ||
      record.get('type') || '<new node>';

    const double_space = "\n\n";
    const quantities = record.get('quantities');
    if (quantities) {
      if (data.label !== '') {
        data.label += double_space;
      }
      data.label += quantities;
    }
    const examples = record.get('examples');
    if (examples) {
      if (data.label !== '') {
        data.label += double_space;
      }
      data.label += examples;
    }

    return {
      group: 'nodes',
      data,
      position: {
        x: record.get('x') * self.refs.div.offsetWidth / config.layout.w,
        y: record.get('y') * self.refs.div.offsetHeight / config.layout.h
      },
      style: {
        'background-color': record.get('color')
      },
      classes: classes.join(' ')
    };
  }

  convertEdge(record, id, nodetype) {
    const classes = [nodetype];
    if (!record.get('active')) {
      classes.push('inactive');
    }
    const data = record.toObject();
    data.id = id;
    data.source = data.from;
    data.target = data.to;
    data.label = record.get('quantities');
    return {
      group: 'edges',
      data,
      style: {
        width: `${record.width}px`,
        'line-style': record.linestyle
      },
      classes: classes.join(' ')
    };
  }

  normalize(elements) {
    const payload = new Map();
    elements.forEach(element => {
      if (element.group() === 'edges') return;

      const position = element.position();
      const x = position.x * config.layout.w / this.refs.div.offsetWidth;
      const y = position.y * config.layout.h / this.refs.div.offsetHeight;

      const data = element.data();
      const record = this.props.state.getIn(['nodes', data.nodetype, data.id]);
      if (x !== record.get('x') || y !== record.get('y')) {
        payload.set(data.id, {x, y});
      }
    });
    if (payload.size > 0) this.props.layoutDone(payload);
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
      ) {
        extremes.top = node;
      }
      if (
        extremes.right === null ||
        node.position().x > extremes.right.position().x
      ) {
        extremes.right = node;
      }
      if (
        extremes.bottom === null ||
        node.position().y > extremes.bottom.position().y
      ) {
        extremes.bottom = node;
      }
      if (
        extremes.left === null ||
        node.position().x < extremes.left.position().x
      ) {
        extremes.left = node;
      }
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

  render() {
    return <div id='graph' ref='div' />;
  }
}
