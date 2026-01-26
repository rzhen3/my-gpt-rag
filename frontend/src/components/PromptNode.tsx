import {
    Handle,
    Position, 
    type NodeProps
} from '@xyflow/react'
import { useState, useCallback, useRef, useEffect } from 'react';

import './PromptNode.css';
import {executeNode} from '../api/client';


function PromptNode({ id, selected} : NodeProps) {

    const [inputValue, setInputValue] = useState('');
    const [displayedPrompt, setDisplayedPrompt] = useState('')
    const [isEditing, setIsEditing] = useState(false);
    const [responseText, setResponseText] = useState('')

    const inputRef = useRef<HTMLInputElement>(null);

    const doSomething = useCallback(async () => {
            console.log('pressed submit');
            setDisplayedPrompt(inputValue);
            setIsEditing(false);
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


    // focus input when entering edit mode
    useEffect(() => {
        if(isEditing && inputRef.current){
            inputRef.current.focus();
        }
    }, [isEditing]);

    return (
        <div className = {`prompt-node ${selected ? 'selected': ''}`}>
            <div>
                <label htmlFor={`prompt-input-${id}`}>Prompt</label>
                {isEditing ? (
                    <input 
                        id={`prompt-input-${id}`}
                        name={`prompt-${id}`}
                        ref={inputRef}
                        className="nodrag"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.ctrlKey) {
                                e.preventDefault();
                                doSomething();
                            }
                            if (e.key === 'Escape') {
                                setIsEditing(false);
                            }
                        }}
                    />
                ) : (
                    <div 
                        className="prompt-preview"
                        onClick={(e) => {
                            // only enter edit mode on single click without shift
                            if(!e.ctrlKey){
                                setIsEditing(true);
                            }
                        }}
                    >
                        {inputValue || 'Click to edit prompt...'}
                    </div>
                )}
                <Handle type='source' position={Position.Top} id = 'output' style = {{opacity: 0 }}/>
                <Handle type='target' position = {Position.Bottom} id = 'input' style = {{ opacity: 0}} />

                {isEditing ? (
                    <button onClick={doSomething} className="nodrag">
                        Submit
                    </button>
                ) : displayedPrompt && (
                    <>
                        <div className="text-display-area">
                            {displayedPrompt}
                        </div>
                        {
                            responseText && (
                                <div className="text-display-area"
                                    style={{marginTop: '10px', backgroundColor: '#e8f5e9'}}>
                                        <strong>Response:</strong> {responseText}
                                </div>
                            )
                        }
                    </>
                    
                )}

            </div>
        </div>
    );
}

export default PromptNode;