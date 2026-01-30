import { RequestQueue } from "../requestQueue";

const testRequestQueue = async (): Promise<void> => {

    const queue = new RequestQueue()

    const results: number[] = [];
    const op1 = () => new Promise(resolve => {
        setTimeout(() => {
            results.push(1);
            resolve(1);
        }, 50);
    })

    const op2 = () => new Promise( resolve => {
        setTimeout(() => {
            results.push(2);
            resolve(2);
        }, 10);
    });

    const op3 = () => new Promise( resolve => {
        results.push(3);
        resolve(3);
    });

    const promises = [
        queue.enqueue(op1),
        queue.enqueue(op2),
        queue.enqueue(op3)
    ]

    await Promise.all(promises)

    console.log(promises)
    // expect: 1, 2, 3
    // otherwise: promise ordering is not handled properly by queue
}

testRequestQueue();