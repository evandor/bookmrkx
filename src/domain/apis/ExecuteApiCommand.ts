import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {Api, ApiResponse, Endpoint} from "src/models/Api";
import {axios} from "boot/axios";
import {uid} from "quasar";

export class ExecuteApiCommand implements Command<ApiResponse> {

  public merge: boolean = true

  constructor(
    public api: Api, public endpoint: Endpoint) {
  }

  async execute(): Promise<ExecutionResult<ApiResponse>> {
    try {
      const headers = {}
      for (const h of this.api.setup!.headers) {
        headers[h.name as keyof object] = h['default' as keyof object]
      }
      const params = {}
      for (const p of this.endpoint!.params) {
        params[p.name as keyof object] = p.value
      }
      const options = {
        method: 'GET',
        url: this.api!.setup!.url + this.endpoint!.path,
        params: params,
        headers: headers
      };
      console.log("calling axios with options", options)
      const response = await axios.request(options);
      console.log(response.data);
      if (this.endpoint) {
        const result = new ApiResponse(uid(), [], [], response.data)
        return new ExecutionResult<ApiResponse>(result,"success")
      }
      return Promise.reject("no endpoint found")
    } catch (error: any) {
      return Promise.reject(error.toString())
    }

  }


}

ExecuteApiCommand.prototype.toString = function cmdToString() {
  return `ExecuteApiCommand: {api=${this.api.setup?.url}, endpoint=${this.endpoint.path}}`;
};
