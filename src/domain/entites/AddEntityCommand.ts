import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useEntitiesService} from "src/services/EntityService";
import {useEntitiesStore} from "stores/entitiesStore";

export class AddEntityCommand implements Command<string> {

  public merge: boolean = true

  constructor(
    public name: string) {
  }

  async execute(): Promise<ExecutionResult<string>> {
    try {
      const res =  await useEntitiesStore().createEntity(this.name)
      return new ExecutionResult<string>("","done")
    } catch (err) {
      return Promise.reject(err)
    }
  }


}

AddEntityCommand.prototype.toString = function cmdToString() {
  return `AddEntityCommand: {name=${this.name}}`;
};
