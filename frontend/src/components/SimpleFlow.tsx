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
    type Node, type Edge, type OnNodesChange, type OnEdgesChange, type OnConnect, type NodeTypes} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TextUpdaterNode from './TextUpdaterNode';

const initialNodes: Node[] = [
    {
        id: 'n1',
        data: { label: 'Start Node'},
        position: { x: 250, y: 250},
    },
    {
        id: 'n2',
        data: { label: 'Output Node' },
        position: { x: 250, y: 200},
    },
    {
        id: 'n3',
        type: 'textUpdater',
        position: { x: 0, y: 0},
        data: { label: 'some node', value: 123},
    }
];

const nodeTypes: NodeTypes = { textUpdater: TextUpdaterNode }

const initialEdges: Edge[] = [
    { id: 'n1-n2', source: 'n1', target: 'n2'}
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
        (connection) => {
            // add edge
            setEdges((eds) => addEdge(connection, eds));
            
            // increment handle counts
            setNodes((nds) =>
                nds.map((node) => {

                    // increment target node handles
                    if (node.id === connection.target && node.type === 'textUpdater'){
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                handleCount: (node.data.handleCount || 1) + 1,
                            },
                        };
                    }

                    // increment source node handles too
                    if (node.id === connection.source && node.type === 'textUpdater'){
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                sourceHandleCount: (node.data.sourceHandleCount || 1) + 1,
                            }
                        };
                    }

                    return node;
                })
            );
            
        }, []
    );


    return (
        <div style = {{width: '100vw', height: '100vh'}}>
            {/* <ReactFlowProvider> */}
                <ReactFlow
                    nodes = {nodes}
                    edges = {edges}
                    nodeTypes = {nodeTypes}
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