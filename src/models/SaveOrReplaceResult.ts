import {Tabset} from "src/models/Tabset";

export class SaveOrReplaceResult {

  constructor(
    public replaced: boolean,
    public tabset: Tabset,
    public merged: boolean
  ) {}

}
