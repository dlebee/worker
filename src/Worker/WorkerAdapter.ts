import { parentPort, workerData } from 'node:worker_threads';
import { RequestMessage } from './RequestMessage';
import { ResponseMessage } from './ResponseMessage';

export class WorkerAdapter {

    static handlers = new Map<string, (request: any) => Promise<any>>();

    static async handle<TRequest, TResponse>(messageType: string, handler: (request: TRequest) => Promise<TResponse>) {
        this.handlers.set(messageType, handler);
    }

    static init() {
        parentPort!.on('message', async (message: RequestMessage) => {  
            const handler = WorkerAdapter.handlers.get(message.messageType);
            if (!handler) {
                throw new Error(`No handler defined for name ${message.messageType}`);
            } 
        
            // parse the message.
            const request = JSON.parse(message.request);
            try {
                const response = await handler(request);
                const serializedResponse = JSON.stringify(response);
                parentPort!.postMessage(<ResponseMessage>{
                    id: message.id,
                    status: 'fulfiled',
                    result: serializedResponse
                });
            } catch (ex) {
                parentPort!.postMessage(<ResponseMessage>{
                    id: message.id,
                    result: JSON.stringify(ex),
                    status: 'error'
                });
            }
        });
    }
}

WorkerAdapter.init();

