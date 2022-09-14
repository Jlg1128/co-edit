import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import Count from '@containers/counter';
import store from './store';
import MainEditor from './editor';
import undoManager from './undoManager';

undoManager.init(store.dispatch);
// @ts-ignore
window.undoManager = undoManager;
const App = () => (
  <div>
    <Count />
    <MainEditor />
  </div>
);

let container = document.getElementById('root');
if (container) {
  let root = createRoot(container);
  root.render(<Provider store={store}><App /></Provider>);
}