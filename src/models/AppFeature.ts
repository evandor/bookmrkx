import Command from "src/domain/Command";
import {ActivateFeatureCommand} from "src/domain/features/ActivateFeature";
import {DeactivateFeatureCommand} from "src/domain/features/DeactivateFeature";
import {FeatureIdent, FeatureType} from "src/models/FeatureIdent";

export class AppFeature {

  public activateCommands: Array<Command<any>> = []
  public deactivateCommands: Array<Command<any>> = []

  constructor(
    public ident: FeatureIdent,
    public type: FeatureType,
    public name: string,
    public icon: string,
    public useIn: string[],
    public requires: FeatureIdent[] = []
  ) {
    this.activateCommands = [new ActivateFeatureCommand(this)]
    this.deactivateCommands = [new DeactivateFeatureCommand(this)]
  }

  setActivateCommands(cmds: Array<Command<any>>): AppFeature {
    this.activateCommands = cmds.concat(this.activateCommands)
    return this
  }

  setDeactivateCommands(cmds: Array<Command<any>>): AppFeature {
    this.deactivateCommands = cmds.concat(this.deactivateCommands)
    return this
  }
}
