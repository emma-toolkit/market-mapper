import Cytoscape from 'cytoscape'
import Dagre from 'dagre'
import CytoscapeDagre from 'cytoscape-dagre'
import debounce from 'lodash.debounce'
import Promise from 'bluebird'
import creators from './creators'
import store from './store'
import graph_style from '../styles/graph.styl'

CytoscapeDagre(Cytoscape, Dagre);

export default (div, elements) => {
  return new Promise(resolve => {
    const margin = div.offsetHeight / 10;
    const one_third = div.offsetHeight / 3;
    
    Cytoscape({
      container: div,
      elements: {
        nodes: elements.nodes,
        edges: elements.edges
      },
      layout: {name: 'null'},
      style: graph_style.toString(),
      zoomingEnabled: false,
      panningEnabled: false,
      ready: e => {
        e.cy.nodes().on('free', debounce(e => {
          store.dispatch(creators.layoutDone(e.cy.nodes()));
        }));

        // Layout chain and infrustructure together
        // in order to determine infrastructure order
        e.cy.elements('.chain, .infrastructure').layout({
          name: 'dagre',
          rankDir: 'LR'
        });
        const infrastructure = e.cy.nodes('.infrastructure').sort(
          (ele1, ele2) => ele1.position().y - ele2.position().y
        );

        // Layout environment
        const environment = e.cy.elements('.environment');
        if (environment.nonempty()) {
          environment.layout({
            name: 'grid',
            boundingBox: {
              x1: 0,
              y1: 0,
              x2: div.offsetWidth,
              y2: one_third - margin
            }
          });
        }

        // Layout chain
        const chain = e.cy.elements('.chain');
        if (chain.nonempty()) {
          chain.layout({
            name: 'dagre',
            rankDir: 'LR'
          });
          chain.layout({
            name: 'dagre',
            rankDir: 'LR',
            boundingBox: getBoundingBox(chain, div, {
              top: one_third,
              right: margin,
              bottom: one_third,
              left: margin
            })
          });
        }

        // Layout infrastructure
        if (infrastructure.nonempty()) {
          infrastructure.layout({
            name: 'grid',
            boundingBox: {
              x1: 0,
              y1: one_third * 2 + margin,
              x2: div.offsetWidth,
              y2: div.offsetHeight
            }
          });
        }

        resolve(e.cy.nodes());
      }
    });
  }).then(creators.layoutDone);
}

function getBoundingBox(nodes, div, margins) {
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
    x2: div.offsetWidth - extremes.right.outerWidth() / 2 - margins.right,
    y2: div.offsetHeight - extremes.bottom.outerHeight() / 2 - margins.bottom
  };
}
