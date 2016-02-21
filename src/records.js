import { Record } from 'immutable'

export const Node = Record({
  type: 'nodes',
  nodetype: '',
  id: '',
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
  type: 'edges',
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
