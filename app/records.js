import { Record } from 'immutable'

export const Node = Record({
  name: '',
  x: 0,
  y: 0,
  position: null,
  disruption: null,
  edges: []
});
