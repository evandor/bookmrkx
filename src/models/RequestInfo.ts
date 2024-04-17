export class RequestInfo {

    constructor(
        public statusCode: number,
        public headers: chrome.webRequest.HttpHeader[]
    ) {}

}
