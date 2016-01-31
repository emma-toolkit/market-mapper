import { Map as IMap } from 'immutable'
import { Node, Edge } from './records'

export default function(element_map) {
  let state = new IMap({
    nodes: new IMap({
      environment: new IMap(),
      chain: new IMap(),
      infrastructure: new IMap()
    }),
    edges: new IMap({
      chain: new IMap(),
      infrastructure: new IMap()
    })
  });
  for (let [id, d] of element_map) {
    if (d.element === 'node') {
      let position = null;
      if (parseInt(d.in) === -1) {
        position = 'initial';
      } else if (parseInt(d.out) === -1) {
        position = 'final';
      }
      state = state.setIn(['nodes', d.domain, parseInt(d.id)], Node({
        label: d.label,
        position: position,
        disruption: parseInt(d.disruption) || 0,
        x: parseFloat(d.x) || 0,
        y: parseFloat(d.y) || 0
      }));
    } else {
      const in_id = parseInt(d.in);
      const domain = element_map.get(in_id).domain;
      state = state.setIn(['edges', domain, parseInt(d.id)], Edge({
        label: d.label,
        in: in_id,
        out: parseInt(d.out),
        disruption: parseInt(d.disruption) || 0
      }));
    }
  }
  return state;
}
