import { Record } from 'immutable'

export const Node = Record({
  name: '',
  position: null,
  disruption: 0,
  edges: []
});
