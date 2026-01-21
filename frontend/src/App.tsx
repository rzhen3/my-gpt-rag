import React from 'react';
import SimpleFlow from './components/SimpleFlow';
import './App.css';

function App() {
  return (
      <div className = "App" style={{ width: '100vw', height: '100vh'}}>
        <h2>
          &lt; A better name than 'my-gpt-rag' &gt;
        </h2>
        <SimpleFlow/>
      </div>
  );
}

export default App;
