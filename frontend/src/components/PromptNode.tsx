import {
    Handle,
    Position, 
    type NodeProps
} from '@xyflow/react'
import { useState, useCallback } from 'react';

import './PromptNode.css';
import {executeNode} from '../api/client';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';


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

                <div className="output-label">Output</div>
                <div
                    id={`prompt-output-${id}`}
                    className="prompt-output"
                >
                    {responseText ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                        >
                            {responseText}
                        </ReactMarkdown>
                    ) : (
                        <span style={{ color: '#999' }}>Response will appear here...</span>
                    )}
                </div>

                <Handle type='source' position={Position.Top} id = 'output' style = {{opacity: 0 }}/>
                <Handle type='target' position = {Position.Bottom} id = 'input' style = {{ opacity: 0}} />
            </div>
        </div>
    );
}

export default PromptNode;