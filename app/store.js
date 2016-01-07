import { compose, applyMiddleware, createStore } from 'redux'
import ReduxPromise from 'redux-promise'
import LocalForage from './localforage'
import devtools from '../dev/devtools.jsx'
import reducers from './reducers'

const middleware = [applyMiddleware(ReduxPromise, persist)];
if (process.env.NODE_ENV === 'development')
  middleware.push(devtools.instrument());

export default compose(...middleware)(createStore)(reducers);

function persist(store) {
  return next => action => {
    const result = next(action);
    // if (action.meta && action.meta.persist) {
    //   LocalForage.clear().then(() => {
    //     const state = store.getState();
    //     storeType('environment', state);
    //     storeType('chain', state);
    //     storeType('infrastructure', state);
    //   });
    // }
    return result;
  }
}

// function storeType(type, state) {
//   state.get(type).forEach((node, id) => {
//     const obj = node.toObject();
//     node.type = type;
//     LocalForage.setItem(String(id), node.toObject());
//   });
// }
