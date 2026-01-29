import {
    Handle,
    Position, 
    type NodeProps
} from '@xyflow/react'
import { useState, useCallback, memo } from 'react';

import './PromptNode.css';
import {executeNode} from '../api/client';
import {useModal} from '../contexts/ModalContext'


function PromptNode({ id, selected} : NodeProps) {

    const [inputValue, setInputValue] = useState('');
    const [responseText, setResponseText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const {openModal} = useModal();

    const handleSubmit = useCallback(async () => {

        if (!inputValue.trim()) return; // don't submit if empty
        
        console.log('pressed submit');
        setIsLoading(true);
        setResponseText('Loading...');
        
        // send prompt to whatever LLM
        try{
            const response = await executeNode(id, inputValue);
            console.log('Backend response:', response);

            // update response text in node
            if(response.response){
                setResponseText(response.response)
            }
        } catch(error){
            console.error('Error calling backend:', error);
            setResponseText('Error: Failed to ger response');
        }

        // display response 
    }, [inputValue, id]);

    const handleOpenModal = useCallback(() => {
        openModal({
            nodeId: id,
            inputText: inputValue,
            outputText: responseText
        });
    }, [id, inputValue, responseText, openModal])

    return (
        <div 
            className = {`prompt-node ${selected ? 'selected': ''}`}
            onMouseEnter = {() => setIsHovered(true)}
            onMouseLeave={()=> setIsHovered(false)}
        >
            <div>
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
                    {responseText || <span style = {{ color: '#999'}}>Response will appear here...</span>}
                </div>

                {
                    isHovered && (
                        <>
                            <Handle
                                type = 'source'
                                position = {Position.Right}
                                id = 'output-right'
                                className="handle handle-source"
                                style={{
                                    right: -6,
                                    top: '50%'
                                }}
                            />
                            <Handle
                                type = 'source'
                                position= {Position.Bottom}
                                id='output-bottom'
                                className='handle handle-source'
                                style={{
                                    bottom: -6,
                                    left: '50%'
                                }}
                            />
                            <Handle
                                type="target"
                                position={Position.Left}
                                id="input-left"
                                className="handle handle-target"
                                style={{
                                    left: -6,
                                    top: '50%',
                                    opacity: 0, // Hidden by default, shown via CSS when connecting
                                }}
                            />
                            <Handle
                                type="target"
                                position={Position.Top}
                                id="input-top"
                                className="handle handle-target"
                                style={{
                                    top: -6,
                                    left: '50%',
                                    opacity: 0,
                                }}
                            />
                        </>
                    )
                }
                <Handle type='source' position={Position.Top} id = 'output' style = {{opacity: 0 }}/>
                <Handle type='target' position = {Position.Bottom} id = 'input' style = {{ opacity: 0}} />
            </div>
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