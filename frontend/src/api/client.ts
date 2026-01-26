const API_BASE_URL = 'http://localhost:8000';

export interface ExecuteNodeRequest {
    node_id: string;
    prompt: string;
}

export interface ExecuteNodeResponse {
    status: string;
    node_id: string;
    message?: string;
    response?: string;
}

export const executeNode = async (
    nodeId: string,
    prompt: string
): Promise<ExecuteNodeResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/llm/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            node_id: nodeId,
            prompt: prompt
        }),
    });

    if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
};