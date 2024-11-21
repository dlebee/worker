import { Worker } from 'node:worker_threads';
import { ResponseMessage } from './ResponseMessage';
import { resolve } from 'node:path';
import { rejects } from 'node:assert';
import { RequestMessage } from './RequestMessage';

export interface RequestResponse {
    resolve: (response: any) => void,
    reject: (err: any) => void
}

export interface RequestOptions {
    timeout: number
}

const defaultRequestOptions = { 
    timeout: 60000
}

export class WorkerManager {

    protected processing = new Map<number, RequestResponse>();
    protected requestId: number = 1;

    constructor(readonly worker: Worker) {
        this.hookRequestResponseProtocol();
    }

    private hookRequestResponseProtocol() {
        this.worker.on('message', message => this.handleIncomingMessage(message));
    }

    request<TRequest, TResponse>(messageType: string, request: TRequest, options: Partial<RequestOptions>= {}) : Promise<TResponse> {

        const mergedOptions = Object.assign({}, defaultRequestOptions, options);

        const promise = new Promise<TResponse>((resolve, reject) => {
            const id = this.requestId++;
    
            setTimeout(() => {
                if (this.processing.has(id)) {
                    reject('timeout');
                    this.processing.delete(id);
                }
            }, mergedOptions.timeout);
    
            this.processing.set(id, { resolve, reject });
            
            // send it.
            this.worker.postMessage(<RequestMessage>{
                id: id,
                messageType: messageType,
                request: JSON.stringify(request)
            })
        });
    
        return promise;
    }

    protected handleIncomingMessage(message: ResponseMessage) {
        console.log('message back', message);
        const existingProcess = this.processing.get(message.id);
        if (existingProcess) {
    
            const parsedResult = JSON.parse(message.result);
            if (message.status == 'fulfiled') {
                existingProcess.resolve(parsedResult);
            } else {
                existingProcess.reject(parsedResult);
            }
          
            this.processing.delete(message.id);
        }
    }

    static createWorker(path: string, workerData: Object) {
        const worker = new Worker(path, workerData);
        return new WorkerManager(worker);
    }
}