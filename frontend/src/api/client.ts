import {apiQueue} from '../utils/requestQueue';
import type{
    ExecuteNodeRequest,
    ExecuteNodeResponse,
    CreateNodeRequest,
    CreateNodeResponse,
    CreateEdgeRequest,
    CreateEdgeResponse
} from '../types/api'

const API_BASE_URL = 'http://localhost:8000';

export const executeNode = async (
    request: ExecuteNodeRequest
): Promise<ExecuteNodeResponse> => {


    // node execution via backend
    const response = await fetch(`${API_BASE_URL}/api/llm/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
};

/* hit backend to create node */
export const createNode = async (
    request: CreateNodeRequest
): Promise<CreateNodeResponse> => {
    return apiQueue.enqueue(async () => {

        // node creation via backend
        const response = await fetch(`${API_BASE_URL}/api/llm/nodes/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });

        if(!response.ok){
            throw new Error(`Failed to create node: ${response.status}`)
        }

        return await response.json();
    })
}

/* hit backend to create ege */
export const createEdge = async (
    request: CreateEdgeRequest
): Promise<CreateEdgeResponse> => {
    return apiQueue.enqueue(async () => {

        // actual edge creation
        const response = await fetch(`${API_BASE_URL}/api/llm/edges/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        })

        if(!response.ok){
            throw new Error(`Failed to create edge: ${response.status}`)
        }

        return await response.json()
    })
}