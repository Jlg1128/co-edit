import React from 'react';
import { createRoot } from 'react-dom/client';
import MainEditor from './editor';

const App = () => {
  return (
    <div>
      <MainEditor />
    </div>
  )
}

let container = document.getElementById('root');
if (container) {
  let root = createRoot(container);
  root.render(<App />);
}