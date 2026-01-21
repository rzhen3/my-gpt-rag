import React from 'react';
import { ReactFlow, ReactFlowProvider, type Node, type Edge, Background, Controls} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'input',
        data: { label: 'Start Node'},
        position: { x: 250, y: 250},
    },
    {
        id: '2',
        data: { label: 'Output Node' },
        position: { x: 250, y: 200},
    }
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2'}
];

function SimpleFlow() {
    return (
        <div style = {{width: '100vw', height: '100vh'}}>
            <ReactFlowProvider>
                <ReactFlow
                    nodes = {initialNodes}
                    edges = {initialEdges}
                >
                    <Background/>
                    <Controls/>

                </ReactFlow>

                
            </ReactFlowProvider>


        </div>
    );
};

export default SimpleFlow;

