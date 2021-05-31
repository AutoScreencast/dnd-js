import React from 'react';
import ReactDOM from 'react-dom';
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

// import { Example } from './dustbin'
// import { Example } from './naive'
import { Example } from './custom'

function App() {
  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
        <Example />
      </DndProvider>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
