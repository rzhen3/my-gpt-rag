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

/* hit backend to execute/submit node */
export const executeNode = async (
    request: ExecuteNodeRequest
): Promise<ExecuteNodeResponse> => {
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

        // test by mocking network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockNodeId = Math.floor(Math.random() * 10000).toString();
        console.log('[API Mock] Created node:', mockNodeId)

        return {
            status: 'success',
            node_id: mockNodeId,
            conversation_id: request.conversation_id || 'demo_conversation_001'
        };

        /* REAL IMPLEMENTATION
        const response = await fetch(`${API_BASE_URL}/api/nodes/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        })

        if(!response.ok){
            throw new Error(`Failed to create node: ${response.status}`)
        }

        return await response.json()
        */
    })
}

/* hit backend to create ege */
export const createEdge = async (
    request: CreateEdgeRequest
): Promise<CreateEdgeResponse> => {
    return apiQueue.enqueue(async () => {
        // mock network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockEdgeId = `edge_${Math.floor(Math.random() * 10000)}`;

        console.log('[API Mock] Created edge:', mockEdgeId)

        return {
            status: 'success',
            edge_id: mockEdgeId,
            source_id: request.source_id,
            target_id: request.target_id,
            conversation_id: request.conversation_id
        };


        // actual edge creation
        // const response = await fetch(`${API_BASE_URL}/api/edge/create`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(request)
        // })

        // if(!response.ok){
        //     throw new Error(`Failed to create edge: ${response.status}`)
        // }

        // return await response.json()
    })
}