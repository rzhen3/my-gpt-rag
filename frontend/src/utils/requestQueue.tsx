class RequestQueue{
    private queue: Promise<unknown> = Promise.resolve();
    private queueLength = 0;


    // note: performing .then(foo) on a resolved promise begins 
    // executing foo immediately
    async enqueue<T>(operation: () => Promise<T>): Promise<T>{
        this.queueLength++;

        const result = this.queue
            .then(async () => {
                try{
                    return await operation();
                } catch(error){
                    console.error('Queued operation failed:', error)
                    throw error;
                }
            }
        )
        .finally(() => {
            this.queueLength--;
        });

        this.queue = result.catch(() => {});
        return result;
    }

    getQueueLength(): number{
        return this.queueLength;
    }

    async flush(): Promise<void>{
        await this.queue;
    }
}

export const apiQueue = new RequestQueue();
export function generateTempId(): string{
    if(typeof crypto !== 'undefined' && crypto.randomUUID){
        return `temp_${crypto.randomUUID()}`;
    }

    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
export { RequestQueue }