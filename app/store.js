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
    //     storeElements('nodes', state);
    //     storeElements('edges', state);
    //   });
    // }
    return result;
  }
}

// function storeElements(element, state) {
//   storeData(element, 'environment', state);
//   storeData(element, 'chain', state);
//   storeData(element, 'infrastructure', state);
// }

// function storeData(element, type, state) {
//   state.getIn([element, type]).forEach((d, id) => {
//     const obj = d.toObject();
//     d.element = element;
//     d.type = type;
//     LocalForage.setItem(String(id), d.toObject());
//   });
// }
