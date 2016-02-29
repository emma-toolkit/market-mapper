import { Record } from 'immutable'

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
  active: true
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
  active: true
});
