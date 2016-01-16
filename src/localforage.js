import LocalForage from 'localforage'

LocalForage.config({
  name: 'emma',
  storeName: 'graph'
});

export default LocalForage;
