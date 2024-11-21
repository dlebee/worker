export interface ResponseMessage {
    id: number,
    status: 'fulfiled' | 'error',
    result: any
}