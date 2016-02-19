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
      state = state.setIn(['nodes', d.nodetype, d.id], Node({
        nodetype: d.nodetype,
        id: d.id,
        name: d.name,
        disruption: parseInt(d.disruption) || 0,
        x: parseFloat(d.x) || 0,
        y: parseFloat(d.y) || 0
      }));
    } else {
      const from_id = d.in;
      const nodetype = element_map.get(from_id).nodetype;
      state = state.setIn(['edges', nodetype, d.id], Edge({
        nodetype: nodetype,
        id: d.id,
        name: d.name,
        from: from_id,
        to: d.out,
        disruption: parseInt(d.disruption) || 0
      }));
    }
  }
  return state;
}
