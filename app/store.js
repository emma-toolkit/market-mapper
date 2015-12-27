import { compose, applyMiddleware, createStore } from 'redux'
import ReduxPromise from 'redux-promise'
import devtools from '../dev/devtools.jsx'
import reducers from './reducers'

export default compose(
  applyMiddleware(ReduxPromise),
  devtools.instrument()
)(createStore)(reducers);
