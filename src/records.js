import { Record } from 'immutable'

export const Node = Record({
  nodetype: '',
  id: '',
  name: '',
  disruption: 0,
  x: 0,
  y: 0,
  color: '#ffffff'
});

export const Edge = Record({
  nodetype: '',
  name: '',
  from: null,
  to: null,
  disruption: 0
});
