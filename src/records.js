import { Record } from 'immutable'

export const Node = Record({
  label: '',
  disruption: 0,
  x: 0,
  y: 0
});

export const Edge = Record({
  label: '',
  in: null,
  out: null,
  disruption: 0
});
