import Command from "src/domain/Command";

export class ExecutionResult<T> {
  constructor(
    public result: T,
    public message: string,
    public undoCommand: Command<any> | undefined = undefined) {

  }


}
