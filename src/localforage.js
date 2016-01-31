import { Map as IMap } from 'immutable'
import Promise from 'bluebird'
import { createInstance } from 'localforage'
import { Node, Edge } from './records'

const NAME = 'emma-toolkit';

const stores = {
  app: createInstance({
    name: NAME,
    storeName: 'app'
  }),
  graph: createInstance({
    name: NAME,
    storeName: 'graph'
  })
};

const app_persist = ['show_controls'];

export default {
  set(store, state) {
    stores[store].length()
      .then(n => {
        if (n === 0) {
          setStore(store, state);
        } else {
          stores[store].clear()
            .then(() => setStore(store, state));
        }
      });
  },
  load(state) {
    return loadType('app', state)
      .then(next_state => loadType('graph', next_state));
  }
};

function setStore(store, state) {
  switch (store) {
    case 'app':
      state.get('app').forEach((value, key) => {
        if (app_persist.indexOf(key) > -1) {
          stores[store].setItem(key, value)
        }
      });
      break;
    case 'graph':
      setElements('nodes', 'environment', state);
      setElements('nodes', 'chain', state);
      setElements('nodes', 'infrastructure', state);
      setElements('edges', 'chain', state);
      setElements('edges', 'infrastructure', state);
      break;
  }
}

function setElements(element, domain, state) {
  state.getIn([element, domain]).forEach((d, id) => {
    const obj = d.toObject();
    obj.element = element;
    obj.domain = domain;
    stores.graph.setItem(String(id), obj);
  });
}

function loadType(type, state) {
  const store = stores[type];
  return store.length()
    .then(n => {
      if (n === 0) return state;
      return store.iterate(
        (value, key, i) => {
          let path;
          switch (type) {
            case 'app':
              path = ['app', key];
              break;
            case 'graph':
              path = [value.element, value.domain, key];
              const record = value.element === 'nodes' ? Node : Edge;
              value = record(value);
              break;
          }
          state = state.setIn(path, value);
          if (i === n) return state;
        }
      )
    });
}
