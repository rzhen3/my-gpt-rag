import {
    Handle,
    Position, 
    type NodeProps
} from '@xyflow/react'
import { useCallback, memo, useMemo } from 'react';

import './PromptNode.css';
import {executeNode} from '../api/client';
import {useModal} from '../contexts/ModalContext'
import {useNodeState} from '../hooks/useNodeState';


function PromptNode({ id, selected, dragging} : NodeProps) {
    // custom hook for state management
     const {
        state,
        setPrompt,
        startLoading,
        setResponse,
        setError,
        updateId
     } = useNodeState(id);
    
    // for opening modal panel from within the node
    const {openModal} = useModal();

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    }, [setPrompt]);

    // hitting submit
    const handleSubmit = useCallback(async () => {

        if (!state.prompt.trim()) return; // don't submit if empty
        
        console.log('[PromptNode] Submitting prompt:', state.prompt);
        startLoading();
        
        // send prompt to whatever LLM
        try{
            const response = await executeNode({node_id: state.id, prompt: state.prompt});
            console.log('[PromptNode] Received response:', response);

            // update response text in node
            if(response.response){
                setResponse(response.response);
            }

            // update ID
            if(response.node_id && response.node_id !== state.id){
                console.log('[PromptNode] Reconciling IDs:', state.id, '->', response.node_id);
                updateId(response.node_id)
            }
        } catch(error){
            console.error('[PromptNode] Execution failed:', error);
            setError(error instanceof Error ? error.message : 'Failed to get response');
        }

        // display response 
    }, [state.id, state.prompt, startLoading, setResponse, setError, updateId]);

    const handleOpenModal = useCallback(() => {
        openModal({
            nodeId: state.id,
            inputText: state.prompt,
            outputText: state.response
        });
    }, [state.id, state.prompt, state.response, openModal]);

    const outputDisplay = useMemo(() => {
        if(dragging){
            return 'Moving...';
        }
        if(state.error){
            return <span style={{ color: '#dc3545' }}>Error: {state.error}</span>;
        }
        if(state.isLoading){
            return <span style={{ color: '#007bff' }}>Loading...</span>;
        }
        if(!state.response){
            return <span style = {{ color: '#999'}}> Response will appear here...</span>;
        }

        // display truncated response to
        const maxLength = 100;
        return state.response.length > maxLength 
            ? state.response.substring(0, maxLength) 
            : state.response;
    }, [dragging, state.error, state.isLoading, state.response])

    const statusIndicator = useMemo(() => {
        const colours = {
            idle: '#6c757d',      // Gray
            pending: '#007bff',   // Blue
            confirmed: '#28a745', // Green
            error: '#dc3545'      // Red   
        }

        return (
            <div
                style = {{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: colours[state.status],
                }}
                title={`Status: ${state.status}`}
            />
        )
    }, [state.status])

    return (
        <div className = {`prompt-node ${selected ? 'selected': ''} ${state.status}`}>
            {statusIndicator}
            <label htmlFor={`prompt-input-${id}`}>Prompt</label>
            <textarea
                id = {`prompt-input-${id}`}
                className = "nodrag prompt-input"
                value={state.prompt}
                onChange={handleInputChange}
                onDoubleClick={handleOpenModal}
                placeholder="Enter your prompt..."
                title="Double-click to expand"
                disabled={state.isLoading}
            />

            <button
                onClick={handleSubmit}
                className="nodrag submit-button"
                disabled={!state.prompt.trim() || state.isLoading}
            >
                Submit
            </button>

            <div className="output-label">Output</div>
            <div
                className="prompt-output nodrag"
                onDoubleClick={handleOpenModal}
                title="Double-click to expand"
            >
                {outputDisplay}
            </div>

            <Handle
                type="source"
                position={Position.Right}
                id="output-right"
                className="handle handle-source"
                // No inline style needed - pure CSS control
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="output-bottom"
                className="handle handle-source"
            />

            <Handle
                type="target"
                position={Position.Left}
                id="input-left"
                className="handle handle-target"
            />
            <Handle
                type="target"
                position={Position.Top}
                id="input-top"
                className="handle handle-target"
            />
            </div>
    );
}
// memoize to only prevent re-render when parent updates
export default memo(PromptNode, (prevProps, nextProps) => {

    // only re-render if specific props change
    return (
        prevProps.id === nextProps.id &&
        prevProps.selected === nextProps.selected &&
        prevProps.dragging === nextProps.dragging
    );
});