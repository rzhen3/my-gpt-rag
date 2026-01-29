import React from 'react';
import SimpleFlow from './components/SimpleFlow';
import './App.css';
import NodeDetailModal from './components/NodeDetailModal';
import { ModalProvider } from './contexts/ModalContext';

function App() {
  return (
    <ModalProvider>
      <div className = "App">
        <h2>
          &lt; A better name than 'my-gpt-rag' &gt;
        </h2>
        <SimpleFlow/>
        <NodeDetailModal/>
      </div>

    </ModalProvider>
  );
}

export default App;
