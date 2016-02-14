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
      state = state.setIn(['nodes', d.domain, d.id], Node({
        domain: d.domain,
        id: d.id,
        label: d.label,
        disruption: parseInt(d.disruption) || 0,
        x: parseFloat(d.x) || 0,
        y: parseFloat(d.y) || 0
      }));
    } else {
      const from_id = d.in;
      const domain = element_map.get(from_id).domain;
      state = state.setIn(['edges', domain, d.id], Edge({
        label: d.label,
        from: from_id,
        to: d.out,
        disruption: parseInt(d.disruption) || 0
      }));
    }
  }
  return state;
}
