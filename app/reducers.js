import { Map as IMap } from 'immutable'
import { createReducer, combineReducers } from 'redux-immutablejs'
import actions from './actions'

export default combineReducers({
  nodes: combineReducers({
    environment: createReducer(new IMap(), nodeHandlers('environment')),
    chain: createReducer(new IMap(), nodeHandlers('chain')),
    infrastructure: createReducer(new IMap(),nodeHandlers('infrastructure'))
  }),
  edges: combineReducers({
    chain: createReducer(new IMap(), edgeHandlers('chain')),
    infrastructure: createReducer(new IMap(), edgeHandlers('infrastructure'))
  })
});

function nodeHandlers(type) {
  return {
    [actions.LOAD_DONE]: loadDoneHandler('nodes', type),
    [actions.LAYOUT_DONE]: (state, action) => {
      for (let [id, position] of action.payload) {
        if (state.has(id))
          state = state.mergeIn([id], position);
      }
      return state;
    }
  }
}

function edgeHandlers(type) {
  return {
    [actions.LOAD_DONE]: loadDoneHandler('edges', type)
  }
}

function loadDoneHandler(element, type) {
  return (state, action) => {
    return action.payload.getIn([element, type]);
  }
}
