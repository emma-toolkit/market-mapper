import { Record } from 'immutable'

export const Node = Record({
  domain: '',
  id: '',
  label: '',
  disruption: 0,
  x: 0,
  y: 0
});

export const Edge = Record({
  label: '',
  from: null,
  to: null,
  disruption: 0
});
