import { Record, Map as IMap } from 'immutable'

export const Node = Record({
  element: 'nodes',
  nodetype: '',
  id: '',
  type: '',
  subtype: '',
  name: '',
  disruption: '',
  x: 0,
  y: 0,
  color: '#ffffff',
  examples: '',
  quantities: '',
  active: true,
  states: new IMap({
    0: new IMap({
      active: true,
      quantities: '',
      disruption: ''
    })
  })
});

export const Edge = Record({
  element: 'edges',
  nodetype: '',
  id: '',
  name: '',
  disruption: '',
  from: null,
  to: null,
  width: 1,
  quantities: '',
  active: true,
  states: new IMap({
    0: new IMap({
      active: true,
      width: 1,
      quantities: '',
      disruption: ''
    })
  })
});
