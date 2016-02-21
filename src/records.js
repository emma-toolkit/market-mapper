import { Record } from 'immutable'

export const Node = Record({
  type: 'nodes',
  nodetype: '',
  id: '',
  name: '',
  examples: '',
  disruption: '',
  x: 0,
  y: 0,
  color: '#ffffff'
});

export const Edge = Record({
  type: 'edges',
  nodetype: '',
  id: '',
  name: '',
  disruption: '',
  from: null,
  to: null,
  width: 1
});
