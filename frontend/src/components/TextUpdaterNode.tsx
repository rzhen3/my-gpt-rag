import {
    Handle,
    Position, 
    useUpdateNodeInternals,
    type NodeProps
} from '@xyflow/react'
import { useState, useCallback} from 'react';

import './TextUpdaterNode.css';


function TextUpdaterNode({ id, data: _data }: NodeProps) {
    const updateNodeInternals = useUpdateNodeInternals();
    const [handleCount, setHandleCount] = useState(0);      // dynamic number of handles

    const randomizeHandleCount = useCallback(() => {
        setHandleCount(Math.floor(Math.random() * 10));
        updateNodeInternals(id);
    }, [id, updateNodeInternals])


    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        console.log(evt.target.value);
    }, []);

    return (
        <div className = "text-updater-node">
            <div>
                <label htmlFor="text">Prompt</label>
                <input id="text" name="text2" onChange={onChange} className="nodrag"/>
                <Handle type='source' position={Position.Top} id = 'h1'/>
                <Handle type='target' position = {Position.Bottom} id = 'h2'/>

                {
                    Array.from({ length: handleCount}).map((_, index) => (
                        <Handle
                            key = {index}
                            type = "target"
                            position = {Position.Left}
                            id = {`handle-${index}`}
                            style={{ top: `${(index + 1) * (100 / (handleCount + 1))}%` }}
                        />
                    ))
                }

                    <div>
                        <button onClick={randomizeHandleCount} className = "nodrag">Randomize handle count</button>
                        <p>There are {handleCount} handles on this node.</p>
                    </div>
            </div>

        </div>
    );
}

export default TextUpdaterNode;