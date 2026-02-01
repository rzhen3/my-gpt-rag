export interface NodeSnapshot{
    id: string;
    prompt: string;
    response?: string;
}

export interface CreateNodeRequest{
    position: { x: number; y: number };
    conversation_id?: string;
}

export interface CreateNodeResponse{
    status: string;
    node_id: string;
    conversation_id: string;
}

export interface EdgeData{
    id: string;
    source: string;
    target: string;
    couversation_id?: string;
}

export interface CreateEdgeRequest{
    source_id: string;
    target_id: string;
    conversation_id?: string;
}

export interface CreateEdgeResponse{
    status: string;
    edge_id: string;
    source_id: string;
    target_id: string;
}

export interface ExecuteNodeRequest{
    node_id: string;
    prompt: string;
}

export interface ExecuteNodeResponse{
    status: string;
    node_id: string;
    message?: string;
    response?: string;
}

// maps frontend id to ground truth ID
export interface IDMapping{
    [tempId: string]: string;
};