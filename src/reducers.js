import { Map as IMap, Set as ISet, List } from 'immutable'
import { createReducer, combineReducers } from 'redux-immutablejs'
import actions from './actions'
import { Node, Edge, Note } from './records'
import config from './config.json'

const DEFAULT_NODETYPE = 'chain';
const DEFAULT_STATE_NAME = '';
const DEFAULT_NOTE_TEXT = 'New note.'

export default combineReducers({
  app: createReducer(new IMap({
    last_redraw: null,
    last_layout: null,
    show_splash: true,
    show_controls: true,
    controls: 'app',
    selected: null,
    in_handle: null,
    out_handle: null,
    connecting: false,
    dragging_note: null,
    disruptions: new ISet(),
    state: 0
  }), {
    [actions.RESET_GRAPH]: (state, action) => {
      const app_state = action.payload.state.get('app');
      return app_state.set('show_splash', false);
    },
    [actions.SHOW_SPLASH]: (state, action) =>
      state.set('show_splash', true),
    [actions.HIDE_SPLASH]: (state, action) =>
      state.set('show_splash', false),
    [actions.LOAD_DONE]: (state, action) => {
      state = state.merge(action.payload.state.get('app'));
      return state.set('last_redraw', action.payload.last_redraw);
    },
    [actions.DO_LAYOUT]: (state, action) =>
      state.set('last_layout', action.payload.last_layout),
    [actions.REDRAW]: (state, action) =>
      state.set('last_redraw', action.payload.last_redraw),
    [actions.CLEAR]: (state, action) =>
      state.merge({
        last_redraw: action.payload.last_redraw,
        controls: 'app'
      }),
    [actions.TOGGLE_CONTROLS]: (state, action) =>
      state.merge(action.payload),
    [actions.SHOW_GRAPH_CONTROLS]: (state, action) =>
      state.merge({
        controls: 'graph',
        selected: null
      }),
    [actions.ADD_NODE]: (state, action) =>
      state.merge({
        controls: 'element',
        selected: Node({
          nodetype: action.payload.nodetype,
          id: action.payload.id
        }),
        last_redraw: action.payload.last_redraw
      }),
    [actions.ADD_EDGE]: (state, action) =>
      state.merge({
        controls: 'element',
        selected: Edge({
          nodetype: action.payload.nodetype,
          id: action.payload.id
        }),
        last_redraw: action.payload.last_redraw
      }),
    [actions.REMOVE_ELEMENT]: (state, action) =>
      state.merge({
        controls: 'app',
        last_redraw: action.payload.last_redraw,
        selected: null,
        in_handle: null,
        out_handle: null,
        connecting: false
      }),
    [actions.SELECT_ELEMENT]: (state, action) =>
      state.merge({
        selected: action.payload.element,
        controls: 'element'
      }),
    [actions.DESELECT_ELEMENT]: (state, action) =>
      state.merge({
        selected: null,
        controls: 'app'
      }),
    [actions.SET_IN_HANDLE]: (state, action) =>
      state.set('in_handle', {
        id: action.payload.id,
        x: action.payload.x,
        y: action.payload.y
      }),
    [actions.SET_OUT_HANDLE]: (state, action) =>
      state.set('out_handle', {
        nodetype: action.payload.nodetype,
        id: action.payload.id,
        x: action.payload.x,
        y: action.payload.y
      }),
    [actions.CLEAR_IN_HANDLE]: (state, action) =>
      state.set('in_handle', null),
    [actions.CLEAR_OUT_HANDLE]: (state, action) =>
      state.set('out_handle', null),
    [actions.START_CONNECTING]: (state, action) =>
      state.set('connecting', true),
    [actions.END_CONNECTING]: (state, action) =>
      state.set('connecting', false),
    [actions.START_DRAGGING_NOTE]: (state, action) =>
      state.set('dragging_note', action.payload.id),
    [actions.END_DRAGGING_NOTE]: (state, action) =>
      state.set('dragging_note', null),
    [actions.SET_DISRUPTIONS]: (state, action) =>
      state.set('disruptions', new ISet(action.payload.disruptions)),
    [actions.SET_ELEMENT_ATTRIBUTE]: (state, action) => {
      let record = action.payload.element;
      record = record.set(action.payload.attribute, action.payload.value);
      return state.merge({
        last_redraw: action.payload.last_redraw,
        selected: record
      });
    },
    [actions.REMOVE_STATE]: (state, action) =>
      state.merge({
        last_redraw: action.payload.last_redraw,
        state: action.payload.num - 1
      }),
    [actions.SET_STATE]: (state, action) =>
      state.merge({
        last_redraw: action.payload.last_redraw,
        state: action.payload.num
      })
  }),

  graph: createReducer(new IMap({
    title: 'New Market Map',
    states: new List(['Base'])
  }), {
    [actions.RESET_GRAPH]: (state, action) =>
      action.payload.state.get('graph'),
    [actions.LOAD_DONE]: (state, action) =>
      state.merge(action.payload.state.get('graph')),
    [actions.SET_GRAPH_ATTRIBUTE]: (state, action) =>
      state.set(action.payload.attribute, action.payload.value),
    [actions.SET_STATE_NAME]: (state, action) => {
      let states = state.get('states');
      states = states.set(action.payload.num, action.payload.name);
      return state.set('states', states);
    },
    [actions.ADD_STATE]: (state, action) => {
      let states = state.get('states');
      states = states.push(DEFAULT_STATE_NAME);
      return state.set('states', states);
    },
    [actions.REMOVE_STATE]: (state, action) => {
      let states = state.get('states');
      states = states.pop();
      return state.set('states', states);
    }
  }),

  nodes: combineReducers({
    environment: createReducer(new IMap(), nodeHandlers('environment')),
    chain: createReducer(new IMap(), nodeHandlers('chain')),
    infrastructure: createReducer(new IMap(),nodeHandlers('infrastructure'))
  }),
  edges: combineReducers({
    chain: createReducer(new IMap(), edgeHandlers('chain')),
    infrastructure: createReducer(new IMap(), edgeHandlers('infrastructure'))
  }),

  // notes: createReducer(new IMap(), {
  //   [actions.LOAD_DONE]: (state, action) =>
  //     action.payload.state.get('notes'),
  //   [actions.ADD_NOTE]: (state, action) => {
  //     const id = action.payload.id;
  //     const note = Note({
  //       id,
  //       text: DEFAULT_NOTE_TEXT
  //     });
  //     return state.set(id, note);
  //   },
  //   [actions.END_DRAGGING_NOTE]: (state, action) => {
  //     return state.mergeIn([action.payload.id], action.payload.position)
  //   }
  // })
});

function nodeHandlers(nodetype) {
  const handlers = commonHandlers('nodes', nodetype);
  handlers[actions.LAYOUT_DONE] = (state, action) => {
    for (let [id, coordinates] of action.payload) {
      if (state.has(id)) {
        state = state.mergeIn([id], coordinates);
      }
    }
    return state;
  };
  handlers[actions.ADD_NODE] = (state, action) => {
    if (action.payload.nodetype === nodetype) {
      const x_int = config.layout.w / 8;
      let x = x_int;
      const num_nodes = state.size;
      let i = 0;
      while (i < num_nodes) {
        i = state.forEach(node => {
          if (Math.abs(node.get('x') - x) < x_int) {
            x += x_int;
            return false;
          }
          return true;
        });
      }

      let y;
      switch (nodetype) {
        case 'environment':
          y = (config.layout.h / 6) - (config.layout.h / 20);
          break;
        case 'chain':
          y = config.layout.h / 2;
          break;
        case 'infrastructure':
          y = (config.layout.h * (5/6)) + (config.layout.h / 20);
          break;
      }

      const id = action.payload.id;
      state = state.set(id, Node({
        nodetype,
        id,
        x,
        y
      }));
    }
    return state;
  };
  handlers[actions.REMOVE_ELEMENT] = (state, action) => {
    const element = action.payload.element;
    if (element.element === 'nodes' && element.nodetype === nodetype) {
      state = state.delete(element.id);
    }
    return state;
  };
  return handlers;
}

function edgeHandlers(nodetype) {
  const handlers = commonHandlers('edges', nodetype);
  handlers[actions.REMOVE_ELEMENT] = (state, action) => {
    const element = action.payload.element;
    if (element.element === 'nodes' && nodetype !== 'environment') {
      const id = element.id;
      state.forEach((edge, key) => {
        if (edge.from === id || edge.to === id) {
          state = state.delete(key);
        }
      });
    } else if (element.element === 'edges' && element.nodetype === nodetype) {
      state = state.delete(element.id);
    }
    return state;
  };
  handlers[actions.ADD_EDGE] = (state, action) => {
    if (action.payload.nodetype === nodetype) {
      const id = action.payload.id;
      const edge = Edge({
        nodetype,
        id,
        from: action.payload.from_id,
        to: action.payload.to_id
      });
      state = state.set(id, edge);
    }
    return state;
  };
  return handlers;
}

function commonHandlers(element, nodetype) {
  const stateful = config.stateful[element];
  return {
    [actions.RESET_GRAPH]: (state, action) =>
      action.payload.state.getIn([element, nodetype]),
    [actions.LOAD_DONE]: (state, action) =>
      action.payload.state.getIn([element, nodetype]),
    [actions.CLEAR]: state => state.clear(),
    [actions.SET_ELEMENT_ATTRIBUTE]: (state, action) => {
      if (action.payload.element.element === element) {
        const el = action.payload.element;
        if (el.nodetype === nodetype) {
          let record = state.get(el.id);
          const attribute = action.payload.attribute;
          const value = action.payload.value;
          record = record.set(attribute, value);
          if (stateful.indexOf(attribute) !== -1) {
            const state_str = action.payload.state_num.toString();
            if (!record.hasIn(['states', state_str])) {
              record.setIn(['states', state_str], new IMap());
            }
            record = record.setIn(['states', state_str, attribute], value);
          }
          state = state.set(el.id, record);
        }
      }
      return state;
    },
    [actions.REMOVE_STATE]: (state, action) => {
      state.forEach(el => {
        const state_keys = Array.from(el.get('states').keys()).sort();
        for (let i = 0; i < state_keys.length; i++) {
          const key = parseInt(state_keys[i]);
          if (key >= action.payload.num) {
            let states = el.get('states');
            states = states.delete(key.toString());
            el = el.set('states', states);
            state = state.set(el.get('id'), el);
          }
        }
      });
      return setState(state, action.payload.num - 1, stateful);
    },
    [actions.SET_STATE]: (state, action) => {
      return setState(state, action.payload.num, stateful);
    }
  };
}

function setState(state, num, stateful) {
  state.forEach(el => {
    const state_keys = Array.from(el.get('states').keys()).sort();
    let state_num = null;
    for (let i = 0; i < state_keys.length; i++) {
      const key = parseInt(state_keys[i]);
      if (key > num) {
        state_num = state_keys[i - 1];
        break;
      }
      if (key === num) {
        state_num = num.toString();
        break;
      }
    }
    if (state_num === null) {
      state_num = state_keys[state_keys.length - 1];
    }
    for (const prop of stateful) {
      const state_value = el.getIn(['states', state_num, prop]);
      if (state_value !== undefined) {
        state = state.set(el.id, el.set(prop, state_value));
      }
    }
  });
  return state;
}
