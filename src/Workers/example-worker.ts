import { WorkerAdapter } from "../Worker/WorkerAdapter";
import { FetchRequest, FetchResponse } from "./dto";

WorkerAdapter.handle<FetchRequest, FetchResponse>('fetch-json', async (request) => {

    const res = await fetch(request.url);
    if (res.ok) {
        const body = await res.json();
        const result = JSON.stringify(body);
        return {
            body: result
        };
    }

    throw new Error(`Http request failed with status code ${res.status}`);
});

WorkerAdapter.handle<Object, boolean>("graceful-shutdown", _ => {
    return new Promise<boolean>((res, rej) => {
        console.log('faking graceful shutdown handling, waiting 5s...');
        setTimeout(() => {
            res(true);
        }, 5000);
    });
});
