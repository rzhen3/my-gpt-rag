import {apiQueue} from '../utils/requestQueue';
import type{
    ExecuteNodeRequest,
    ExecuteNodeResponse,
    CreateNodeRequest,
    CreateNodeResponse,
    CreateEdgeRequest,
    CreateEdgeResponse,
    DeleteEdgeRequest,
    DeleteEdgeResponse,
    DeleteNodeRequest,
    DeleteNodeResponse
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

export const deleteEdge = async (
    request: DeleteEdgeRequest
): Promise<DeleteEdgeResponse> => {
    return apiQueue.enqueue(async () => {
        console.log('[FrontendAPI] Deleting edge:', request.edge_id);

        const response = await fetch(`${API_BASE_URL}/api/llm/edges/delete`,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        })
        
        if(!response.ok){
            const errorText = await response.text();
            console.error('[API] Delete edge failed:', response.status, errorText);
            throw new Error(`Failed to delete edge: ${response.status} - ${errorText}`)

        }

        const result = await response.json();
        console.log('[API] Delete edge success:', result);
        return result;
    });
}

export const deleteNode = async(
    request: DeleteNodeRequest
): Promise<DeleteNodeResponse> => {

    return apiQueue.enqueue(async () => {

        console.log('[API] Deleting node:', request.node_id);

        const response = await fetch(`${API_BASE_URL}/api/llm/nodes/delete`, {
            method: 'DELETE',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });

        // handle bad response
        if(!response.ok){
            const errorText = await response.text();
            console.error('[API] Delete node failed:', response.status, errorText);
            throw new Error(`Failed to delete node: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('[API] Delete node success:', result);
        // Log cascade deletion info
        if (result.edges_deleted_count > 0) {
            console.log(`[API] Cascade-deleted ${result.edges_deleted_count} edge(s)`);
        }

        return result;
    });
}