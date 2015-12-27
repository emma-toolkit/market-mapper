import { Record } from 'immutable'

export const Node = Record({
  name: '',
  x: 0, y: 0,
  w: 0, h: 0,
  edges: []
});
