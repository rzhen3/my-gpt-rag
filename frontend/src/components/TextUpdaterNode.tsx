import {
    Handle,
    Position, 
    useUpdateNodeInternals,
    type NodeProps
} from '@xyflow/react'
import { useEffect, useCallback } from 'react';

import './TextUpdaterNode.css';

// type TextUpdaterData = {
//     label?: string;
//     handleCount?: number;
// }


function TextUpdaterNode({ id, data } : NodeProps) {
    const updateNodeInternals = useUpdateNodeInternals();
    const handleCount = (data.handleCount as number  | undefined)|| 1;

    useEffect(() => {
        updateNodeInternals(id);
    }, [handleCount, id, updateNodeInternals]);

    const doSomething = useCallback(() => {
            console.log('pressed submit');
        }, []);

    return (
        <div className = "text-updater-node">
            <div>
                <label htmlFor={`test-${id}`}>Prompt</label>
                <input 
                    id={`test-${id}`} 
                    name="text" 
                    className="nodrag"
                />
                <Handle type='source' position={Position.Top} id = 'h1'/>
                <Handle type='target' position = {Position.Bottom} id = 'h2'/>

                {
                    Array.from({ length: handleCount}).map((_, index) => (
                        <Handle
                            key = {index}
                            type = "target"
                            position = {Position.Left}
                            id = {`handle-${index}`}
                            style={{
                                 top: `${(index + 1) * (100 / (handleCount + 1))}%` 
                            }}
                        />
                    ))
                }

                <div>
                    <button onClick={doSomething} className = "nodrag">Submit</button>
                </div>

            </div>
        </div>
    );
}

export default TextUpdaterNode;