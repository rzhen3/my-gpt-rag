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
import {generateTempId} from '../utils/requestQueue';
import {createNode as createNodeAPI} from '../api/client'

const nodeTypes: NodeTypes = { prompt: PromptNode }

function SimpleFlow() {

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [nodeIdCounter, setNodeIdCounter] = useState(1);
    const [isCreatingNode, setIsCreatingNode] = useState(false);

    const [conversationId] = useState<string>('demo_conversation_001')

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)), []
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)), []
    );

    /** create new prompt */
    const addPromptNode = useCallback(async () => {
        setIsCreatingNode(true);
        const tempId = generateTempId();

        const position = {
            x: Math.random() * 500,
            y: Math.random() * 500,
        }

        const newNode: Node = {
            id: tempId,
            type: 'prompt',
            position: position,
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

        // tell background about node
        try{
            const response = await createNodeAPI({
                position,
                conversation_id: conversationId
            });

            console.log('[SimpleFlow] Backend confirmed node:', response.node_id);

            // update id for newly created node based on backend
            setNodes((nds) => nds.map(node => 
                node.id === tempId
                    ? { ...node, id:response.node_id }
                    : node
            ))

            // also update backend
            setEdges((eds) => eds.map(edge => ({
                ...edge,
                source: edge.source === tempId ? response.node_id : edge.source,
                target: edge.target === tempId ? response.node_id : edge.target
            })));

            console.log(`[SimpleFlow] ID reconciliation for:${tempId} -> ${response.node_id}`);
        }catch(error){
            console.error('[SimpleFlow] Failed to create node:', error);

            // rollback nodes
            setNodes((nds) => nds.filter(node => node.id !== tempId));
            alert('Failed to create node. Please try again.');
        }finally{
            setIsCreatingNode(false);
        }
    }, [conversationId, nodeIdCounter]);

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
                    disabled={isCreatingNode}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: isCreatingNode ? '#6c757d' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isCreatingNode ? 'not-allowed':'pointer',
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
                <div style={{marginTop: '10px', fontSize: '11px', color: '#666'}}>
                    <strong>Debug Info:</strong>
                    <div>Total nodes: {nodes.length}</div>
                    <div>Temp IDs: {nodes.filter(n => n.id.startsWith('temp_')).length}</div>
                    <div>Real IDs: {nodes.filter(n => !n.id.startsWith('temp_')).length}</div>
                </div>

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