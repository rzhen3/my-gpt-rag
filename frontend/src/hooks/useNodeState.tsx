import {useState, useCallback} from 'react';

/**
 * custom hook for PromptNode state management
 */

export interface NodeState{
    id: string;
    prompt: string;
    response: string;
    isLoading: boolean;
    error: string | null;
    status: 'idle' | 'pending' | 'confirmed' | 'error';
}

export function useNodeState(initialId: string){
    /** default state */
    const [state, setState] = useState<NodeState>({
        id: initialId,
        prompt: '',
        response: '',
        isLoading: false,
        error: null,
        status: 'idle',
    });

    /** update local prompt text. typing */
    const setPrompt = useCallback((prompt: string) => {
        setState(prev => ({ ...prev, prompt}))
    }, []);

    /** start loading state. waiting for backend response */
    const startLoading = useCallback(() => {
        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
            status: 'pending',
            response: 'Loading...'
        }));
    }, []);

    /** set response after successful call. following ok backend response */
    const setResponse = useCallback((response: string) => {
        setState(prev => ({
            ...prev,
            response,
            isLoading: false,
            error: null,
            status: 'confirmed'
        }));
    },[]);

    /** set error after failed call. following bad backend response */
    const setError = useCallback((error: string) => {
        setState(prev => ({
            ...prev,
            response: '',
            isLoading: false,
            error,
            status: 'error',
        }));
    },[]);

    /** set node id. following initial node creation */
    const updateId = useCallback((newId: string) => {
        setState(prev => ({
            ...prev,
            id: newId,
            status: 'confirmed'
        }));
    }, []);

    /** reset */
    const reset = useCallback(() => {
        setState({
            id: initialId,
            prompt: '',
            response: '',
            isLoading: false,
            error: null,
            status: 'idle'
        });
    },[initialId]);

    return {
        state,
        setPrompt,
        startLoading,
        setResponse,
        setError,
        updateId,
        reset
    };
}