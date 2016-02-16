import { Record } from 'immutable'

export const Node = Record({
  type: 'nodes',
  nodetype: '',
  id: '',
  name: '',
  examples: '',
  disruption: 0,
  x: 0,
  y: 0,
  color: '#ffffff'
});

export const Edge = Record({
  type: 'edges',
  nodetype: '',
  id: '',
  name: '',
  disruption: 0,
  from: null,
  to: null
});
