import {
    Handle,
    Position, 
    type NodeProps
} from '@xyflow/react'
import { useState, useCallback, memo, useMemo } from 'react';

import './PromptNode.css';
import {executeNode} from '../api/client';
import {useModal} from '../contexts/ModalContext'


function PromptNode({ id, selected, dragging} : NodeProps) {

    const [inputValue, setInputValue] = useState('');
    const [responseText, setResponseText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // for opening modal panel from within the node
    const {openModal} = useModal();

    // hitting submit
    const handleSubmit = useCallback(async () => {

        if (!inputValue.trim()) return; // don't submit if empty
        
        console.log('pressed submit');
        setIsLoading(true);
        setResponseText('Loading...');
        
        // send prompt to whatever LLM
        try{
            const response = await executeNode({node_id: id, prompt: inputValue});
            console.log('Backend response:', response);

            // update response text in node
            if(response.response){
                setResponseText(response.response)
            }
        } catch(error){
            console.error('Error calling backend:', error);
            setResponseText('Error: Failed to ger response');
        }finally{
            setIsLoading(false)
        }

        // display response 
    }, [inputValue, id]);

    const handleOpenModal = useCallback(() => {
        openModal({
            nodeId: id,
            inputText: inputValue,
            outputText: responseText
        });
    }, [id, inputValue, responseText, openModal]);

    const outputDisplay = useMemo(() => {
        if(dragging){
            return 'Moving...';
        }
        if(!responseText){
            return <span style = {{ color: '#999'}}> Response will appear here...</span>;
        }
        return responseText;
    }, [responseText, dragging])

    return (
        <div className = {`prompt-node ${selected ? 'selected': ''}`}>
                <label htmlFor={`prompt-input-${id}`}>Prompt</label>
                <textarea
                    id = {`prompt-input-${id}`}
                    className = "nodrag prompt-input"
                    value={inputValue}
                    onChange={(e)=>setInputValue(e.target.value)}
                    onDoubleClick={handleOpenModal}
                    placeholder="Enter your prompt..."
                    title="Double-click to expand"
                />
                <button
                    onClick={handleSubmit}
                    className="nodrag submit-button"
                    disabled={!inputValue.trim() || isLoading}
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