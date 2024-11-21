import { RequestMessage } from "./Worker/RequestMessage";
import { WorkerManager } from "./Worker/WorkerManager";
import { FetchRequest, FetchResponse } from "./Workers/dto";

const workerManager = WorkerManager.createWorker("./dist/Workers/example-worker.js", {});

async function go() {
    const response = await workerManager.request<FetchRequest, FetchResponse>("fetch-json", {
        url: 'https://api.creditcoin.org/network/v1/networks/evm'
    });

    console.log('body of response coming from fetch-request to worker', response.body);
}

go().then(async () => {
    await workerManager.request("graceful-shutdown", {});
    process.exit();
})