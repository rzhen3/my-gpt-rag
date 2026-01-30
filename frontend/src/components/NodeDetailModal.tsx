import {useEffect, memo} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useModal } from '../contexts/ModalContext'
import './NodeDetailModal.css';
import { createPortal } from 'react-dom';

/** Component for the detailed node viewing panel */

const MarkdownContent = memo(({ content }: {content: string}) => (
    <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
    >
        {content}
    </ReactMarkdown>
))


function NodeDetailModal(){
    /** import context for controlling Modal panel */
    const { isOpen, modalData, closeModal } = useModal();
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen){
                e.preventDefault();
                e.stopPropagation();
                closeModal();
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
    }, [isOpen, closeModal])

    /** no component if no modalData or not open */
    if (!isOpen || !modalData) return null;

    return createPortal(
        <div className = 'modal-overlay' onClick = {closeModal}>
            <div className = 'modal-content' onClick = {(e) => e.stopPropagation()}>
                <div className = 'modal-header'>
                    <h2>Node {modalData.nodeId}</h2>
                    <button className = "close-button" onClick={closeModal}>x</button>
                </div>

                <div className = 'modal-body'>
                    <div className="modal-section">
                        <h3>Input</h3>
                        <div className = 'modal-input'>
                            {modalData.inputText || <span className="placeholder">No input yet</span>}
                        </div>
                    </div>

                    <div className = 'modal-section'>
                        <h3>Output</h3>
                        <div className = 'modal-output'>
                            {
                                modalData.outputText ? (
                                    <MarkdownContent content = {modalData.outputText} />
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
    );
}

export default memo(NodeDetailModal);