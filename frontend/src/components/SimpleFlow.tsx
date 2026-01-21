import { useState, useCallback } from 'react';
import { ReactFlow, 
    // ReactFlowProvider, 
    Background, 
    BackgroundVariant,
    Controls, 
    MiniMap,
    applyNodeChanges, 
    applyEdgeChanges, 
    addEdge, 
    type Node, type Edge, type OnNodesChange, type OnEdgesChange, type OnConnect} from '@xyflow/react';
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

    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)), []
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)), []
    );

    const onConnect: OnConnect = useCallback(
        (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)), []
    );


    return (
        <div style = {{width: '100vw', height: '100vh'}}>
            {/* <ReactFlowProvider> */}
                <ReactFlow
                    nodes = {nodes}
                    edges = {edges}
                    onNodesChange = {onNodesChange}
                    onEdgesChange = {onEdgesChange}
                    onConnect = {onConnect}
                    fitView
                >
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1}/>
                    <MiniMap />
                    <Controls/>

                </ReactFlow>
            {/* </ReactFlowProvider> */}

        </div>
    );
};

export default SimpleFlow;