import { compose, applyMiddleware, createStore } from 'redux'
import ReduxPromise from 'redux-promise'
import local from './localforage'
import devtools from '../dev/devtools.jsx'
import reducers from './reducers'

const middleware = [applyMiddleware(ReduxPromise, persist)];
if (process.env.NODE_ENV === 'development')
  middleware.push(devtools.instrument());

export default compose(...middleware)(createStore)(reducers);

// Middleware that stores state locally
function persist(store) {
  return next => action => {
    const result = next(action);
    if (!action.meta) return result;
    const state = store.getState();
    if (action.meta.persist_app) local.set('app', state);
    if (action.meta.persist_graph) local.set('graph', state);
    return result;
  }
}
