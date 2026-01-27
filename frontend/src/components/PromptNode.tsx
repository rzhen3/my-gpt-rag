import {
    Handle,
    Position, 
    type NodeProps
} from '@xyflow/react'
import { useState, useCallback } from 'react';

import './PromptNode.css';
import {executeNode} from '../api/client';


function PromptNode({ id, selected} : NodeProps) {

    const [inputValue, setInputValue] = useState('');
    const [responseText, setResponseText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <div className = {`prompt-node ${selected ? 'selected': ''}`}>
            <div>
                <label htmlFor={`prompt-input-${id}`}>Prompt</label>
                <textarea
                    id = {`prompt-input-${id}`}
                    className = "nodrag prompt-input"
                    value={inputValue}
                    onChange={(e)=>setInputValue(e.target.value)}
                    placeholder="Enter your prompt..."
                />
                <button
                    onClick={handleSubmit}
                    className="nodrag submit-button"
                    disabled={!inputValue.trim() || isLoading}
                >
                    Submit
                </button>

                <label htmlFor={`prompt-output-${id}`}>Output</label>
                <div
                    id={`prompt-output-${id}`}
                    className="prompt-output"
                >
                    {responseText || 'Awaiting your command...'}
                </div>

                <Handle type='source' position={Position.Top} id = 'output' style = {{opacity: 0 }}/>
                <Handle type='target' position = {Position.Bottom} id = 'input' style = {{ opacity: 0}} />
            </div>
        </div>
    );
}

export default PromptNode;