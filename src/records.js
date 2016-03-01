import { Record, Map as IMap } from 'immutable'

export const Node = Record({
  element: 'nodes',
  nodetype: '',
  id: '',
  type: 'Other',
  subtype: '',
  name: 'New Entity',
  disruption: '',
  x: 0,
  y: 0,
  color: '#ffffff',
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
  linestyle: 'solid',
  quantities: '',
  active: true,
  states: new IMap({
    0: new IMap({
      active: true,
      width: 1,
      linestyle: 'solid',
      quantities: '',
      disruption: ''
    })
  })
});

export const Note = Record({
  element: 'notes',
  id: '',
  text: '',
  x: 0,
  y: 0
});
