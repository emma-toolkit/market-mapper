import { Record } from 'immutable'

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
  quantities: '',
  active: true
});
