import { Map as IMap, List } from 'immutable'
import Promise from 'bluebird'
import { createInstance } from 'localforage'
import { Node, Edge, Note } from './records'
import config from './config'

const NAME = 'emma-toolkit';
const APP_PERSIST = [
  'show_controls',
  'state'
];
const GRAPH_PERSIST = [
  'title',
  'created_at',
  'edited_at',
  'state'
];

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
  },
  clear() {
    return stores['app'].clear()
      .then(() => stores['graph'].clear());
  }
};

function setStore(store, state) {
  switch (store) {
    case 'app':
      state.get('app').forEach((value, key) => {
        if (APP_PERSIST.indexOf(key) > -1) {
          stores[store].setItem(key, value)
        }
      });
      break;
    case 'graph':
      for (const prop of GRAPH_PERSIST) {
        let value = state.getIn(['graph', prop]);
        if (List.isList(value)) {
          value = value.toArray();
        }
        stores.graph.setItem(prop, {
          type: 'meta',
          value
        });
      }
      setElements('nodes', 'environment', state);
      setElements('nodes', 'chain', state);
      setElements('nodes', 'infrastructure', state);
      setElements('edges', 'chain', state);
      setElements('edges', 'infrastructure', state);
      state.get('notes').forEach((note, id) => {
        const obj = note.toObject();
        obj.element = 'notes';
        stores.graph.setItem(String(id), obj);
      });
      break;
  }
}

function setElements(element, nodetype, state) {
  state.getIn([element, nodetype]).forEach((d, id) => {
    const obj = d.toObject();
    obj.element = element;
    obj.states = obj.states.toObject();
    for (var num in obj.states) {
      obj.states[num] = obj.states[num].toObject();
    }
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
          let path, new_value;
          switch (type) {
            case 'app':
              path = ['app', key];
              new_value = value;
              break;
            case 'graph':
              if (value.type === 'meta') {
                path = ['graph', key];
                if (key === 'states') {
                  new_value = new List(value.value);
                } else {
                  new_value = value.value;
                }
              } else {
                if (value.element === 'notes') {
                  path = ['notes', key];
                  new_value = Note(value);
                } else {
                  path = [value.element, value.nodetype, key];
                  for (var prop in value.states) {
                    value.states[prop] = new IMap(value.states[prop]);
                  }
                  value.states = new IMap(value.states);
                  const record = value.element === 'nodes' ? Node : Edge;
                  new_value = record(value);
                }
              }
              break;
          }
          state = state.setIn(path, new_value);
          if (i === n) return state;
        }
      )
    });
}
