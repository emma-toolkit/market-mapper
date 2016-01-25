import { compose, applyMiddleware, createStore } from 'redux'
import ReduxPromise from 'redux-promise'
import LocalForage from './localforage'
import devtools from '../dev/devtools.jsx'
import reducers from './reducers'

const middleware = [applyMiddleware(ReduxPromise, persist)];
if (process.env.NODE_ENV === 'development') {
  middleware.push(devtools.instrument());
}

export default compose(...middleware)(createStore)(reducers);

// Middleware that stores state locally
function persist(store) {
  return next => action => {
    const result = next(action);
    if (action.meta && action.meta.persist) {
      LocalForage.clear().then(() => {
        const state = store.getState();
        storeData('nodes', 'environment', state);
        storeData('nodes', 'chain', state);
        storeData('nodes', 'infrastructure', state);
        storeData('edges', 'chain', state);
        storeData('edges', 'infrastructure', state);
      });
    }
    return result;
  }
}

function storeData(element, type, state) {
  state.getIn([element, type]).forEach((d, id) => {
    const obj = d.toObject();
    obj.element = element;
    obj.type = type;
    LocalForage.setItem(String(id), obj);
  });
}
