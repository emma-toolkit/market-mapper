import { compose, createStore } from 'redux'
import devtools from '../dev/devtools.jsx'
import reducers from './reducers'

export default compose(
  devtools.instrument()
)(createStore)(reducers);
