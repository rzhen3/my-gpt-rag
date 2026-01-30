import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, ConnectionMode,
    MarkerType,
    Background, 
    BackgroundVariant,
    Controls, 
    MiniMap,
    applyNodeChanges, 
    applyEdgeChanges, 
    addEdge, 
    // useReactFlow,
    type Node, 
    type Edge, 
    type OnNodesChange, 
    type OnEdgesChange, 
    type OnConnect, 
    type NodeTypes,
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
        selectable: true,
        focusable: true
    },
    {
        id: 'n2',
        type: 'prompt',
        position: { x: 67, y: 67},
        data: { label: 'some other node', value: 123},
        connectable: true,
        draggable: true,
        selectable: true,
        focusable: true
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

    /** create new prompt */
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
            draggable: true,
            selectable: true,
            deletable: true,
            focusable: true
        };

        setNodes((nds) => [...nds, newNode]);
        setNodeIdCounter((count) => count + 1);
    }, [nodeIdCounter]);

    /** delete selected nodes */
   const deleteSelected = useCallback(() => {
        const selectedNodes = nodes.filter((node) => node.selected);
        const selectedEdges = edges.filter((edge) => edge.selected);
        const selectedNodeIds = selectedNodes.map((node) => node.id);

        if (selectedNodeIds.length > 0){
            setNodes((nds) => nds.filter((node) => !node.selected));
            setEdges((eds) => eds.filter(
                (edge) => !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
            ));
        }

        if(selectedEdges.length > 0){
            setEdges((eds) => eds.filter((edge) => !edge.selected));
        }

   }, [nodes, edges]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            const isInputField = target.tagName === 'INPUT' || 
                target.tagName === 'TEXTAREA' || 
                target.isContentEditable;

            // ctr + n: create new node
            if((event.shiftKey) && event.key === 'N'){
                event.preventDefault();
                event.stopPropagation();
                addPromptNode();
                console.log('Creating new node')
            }

            // del + backspace: delete selectedNodes
            if(!isInputField && (event.key === 'Delete' || event.key === 'Backspace')){
                event.preventDefault();
                event.stopPropagation();
                deleteSelected();
                console.log('Deleting nodes');
            }

            // esc
            if(event.key === 'Escape'){
                event.preventDefault();
                event.stopPropagation();
                setNodes((nds) => nds.map((node) => ({...node, selected:false})))
                setEdges((eds) => eds.map((edge) => ({...edge, selected:false})))
                console.log('Deselecting all');
            }  
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [addPromptNode, deleteSelected]);
    
   /** validating proper node connection */
    const isValidConnection = useCallback((connection: Connection | Edge) => {
        // Prevent connecting to self
        if (connection.source === connection.target) {
            return false;
        }

        /** at most one connection between any two nodes */
        const connectionExists = edges.some(
            (edge) => 
                edge.source === connection.source &&
                edge.target === connection.target
        );
        if(connectionExists){
            return false;
        }

        const isDuplicate = edges.some(
            (edge) => 
            edge.source === connection.source && 
            edge.target === connection.target
        );

        if (connection.sourceHandle?.startsWith('input-')) {
            return false;
        }
        if (connection.targetHandle?.startsWith('output-')) {
            return false;
        }

        return !isDuplicate;
    }, [edges]);

    /** creating new edge */
    const onConnect: OnConnect = useCallback(
        (connection) => {
            // Create unique edge ID that includes handle information
            const edgeId = `e${connection.source}-${connection.target}`;

            const newEdge: Edge = {
                ...connection,
                id: edgeId,
                type: 'default',
                selectable: true,
                focusable: true,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 10,
                    height: 10,
                    color: '#555'
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
                flexDirection: 'column',
                gap: '5px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '12px',
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
                <div><strong>Shortcuts:</strong></div>
                <div>Shift + N: New Node</div>
                <div>Delete/Backspace: Delete</div>
                <div>Esc: Deselect All</div>
                <div>Enter: Submit (when node selected)</div>

                {/* Debug: Show selected nodes */}
                <div style={{marginTop: '10px', color: 'blue'}}>
                    Selected: {nodes.filter(n => n.selected).map(n => n.id).join(', ') || 'None'}
                </div>
                
                {/* Test button to select first node */}
                <button onClick={() => {
                    setNodes((nds) => nds.map((node, i) => ({
                        ...node,
                        selected: i === 0
                    })));
                }}>
                    Select First Node (Test)
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
                    elevateEdgesOnSelect={true}
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