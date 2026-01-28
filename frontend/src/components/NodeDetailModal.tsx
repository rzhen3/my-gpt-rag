import {useEffect} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import './NodeDetailModal.css';
import { createPortal } from 'react-dom';

interface NodeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodeId: string;
    inputText: string;
    outputText: string;
}


function NodeDetailModal({ isOpen, onClose, nodeId, inputText, outputText }: NodeDetailModalProps){
    
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen){
                e.preventDefault();
                e.stopPropagation();
                onClose();
            }
        };

        if (isOpen){
            document.addEventListener('keydown', handleEscape, true);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape, true);
            document.body.style.overflow = 'unset';
        }
    }, [isOpen, onClose])

    if (!isOpen) return null;

    return createPortal(
        <div className = 'modal-overlay' onClick = {onClose}>

            <div className = 'modal-content' onClick = {(e) => e.stopPropagation()}>
                <div className = 'modal-header'>
                    <h2>Node {nodeId}</h2>
                    <button className = "close-button" onClick={onClose}>x</button>
                </div>

                <div className = 'modal-body'>
                    <div className="modal-section">
                        <h3>Input</h3>
                        <div className = 'modal-input'>
                            {inputText || <span className="placeholder">No input yet</span>}
                        </div>
                    </div>

                    <div className = 'modal-section'>
                        <h3>Output</h3>
                        <div className = 'modal-output'>
                            {
                                outputText ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {outputText}
                                    </ReactMarkdown>
                                ) : (
                                    <span className="placeholder">No output yet</span>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default NodeDetailModal;