import {ExecutionResult} from "src/domain/ExecutionResult";

export default interface Command<T> {

  execute: () => Promise<ExecutionResult<T>> //ICommandResponse

}
