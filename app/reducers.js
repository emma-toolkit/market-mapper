import { Map as IMap, List } from 'immutable'
import { createReducer, combineReducers } from 'redux-immutablejs'
import { Node } from './records'
import actions from './actions'

export default combineReducers({
  environment: createReducer(new IMap(), typeHandlers('environment')),
  chain: createReducer(new IMap(), typeHandlers('chain')),
  infrastructure: createReducer(new IMap(), typeHandlers('infrastructure'))
});

function typeHandlers(type) {
  return {
    [actions.LOAD_NODES]: function(state, action) {
      for (let [id, val] of action.payload[type])
        state = state.set(parseInt(id), Node(val));
      return state;
    }
  }
}
