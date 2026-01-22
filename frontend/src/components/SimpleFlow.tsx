import { useState, useCallback } from 'react';
import { ReactFlow, ConnectionMode,
    MarkerType,
    Background, 
    BackgroundVariant,
    Controls, 
    MiniMap,
    applyNodeChanges, 
    applyEdgeChanges, 
    addEdge, 
    type Node, type Edge, type OnNodesChange, type OnEdgesChange, type OnConnect, type NodeTypes,
    type Connection,
    } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PromptNode from './PromptNode';

const initialNodes: Node[] = [
    {
        id: 'n1',
        type: 'prompt',
        position: { x: 0, y: 0},
        data: { label: 'some node', value: 123},
        connectable: true,
        draggable: true,
    },
    {
        id: 'n2',
        type: 'prompt',
        position: { x: 67, y: 67},
        data: { label: 'some other node', value: 123},
        connectable: true,
        draggable: true,
    }
];

const nodeTypes: NodeTypes = { prompt: PromptNode }

const initialEdges: Edge[] = [];

function SimpleFlow() {

    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [nodeIdCounter, setNodeIdCounter] = useState(4);


    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)), []
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)), []
    );

    const addPromptNode = useCallback(() => {
        const newNode: Node = {
            id: `n${nodeIdCounter}`,
            type: 'prompt',
            position: {

                x: Math.random() * 500,
                y: Math.random() * 500
            },
            data: {
                label: `Node ${nodeIdCounter}`,
            },
            connectable: true,
            draggable: true
        };

        setNodes((nds) => [...nds, newNode]);
        setNodeIdCounter((count) => count + 1);
    }, [nodeIdCounter]);
    
    const isValidConnection = useCallback((connection: Connection | Edge) => {
        // Prevent connecting to self
        if (connection.source === connection.target) {
            return false;
        }

        const isDuplicate = edges.some(
            (edge) => 
                edge.source === connection.source && edge.target === connection.target
        );

        return !isDuplicate;
    }, [edges]);

    const onConnect: OnConnect = useCallback(
        (connection) => {

            const newEdge: Edge = {
                ...connection,
                id: `e${connection.source}-connection.target`,
                type: 'default',
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 10,
                    height: 10,
                    color: '#000'
                },

                data: {
                    label: 'Flow',
                    timestamp: new Date().toISOString(),
                },

                style: {
                    strokeWidth: 2,
                    stroke: '#555'
                }
            }

            // add edge
            setEdges((eds) => addEdge(newEdge, eds));
                        
        }, []
    );


    return (
        <div style = {{width: '100vw', height: '100vh'}}>
            {/* Toolbar with Add Node button */}
            <div style={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 10,
                display: 'flex',
                gap: '10px',
            }}>
                <button
                    onClick={addPromptNode}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                    }}
                >
                    + Add Prompt Node
                </button>
            </div>
            {/* <ReactFlowProvider> */}
                <ReactFlow
                    nodes = {nodes}
                    edges = {edges}
                    nodeTypes = {nodeTypes}
                    onNodesChange = {onNodesChange}
                    onEdgesChange = {onEdgesChange}
                    onConnect = {onConnect}
                    connectionMode = {ConnectionMode.Loose}
                    isValidConnection = {isValidConnection}
                    connectOnClick = {false}
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