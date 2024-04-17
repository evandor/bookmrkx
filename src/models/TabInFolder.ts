import {Tab} from "src/models/Tab";
import {Tabset} from "src/models/Tabset";

export class TabInFolder {
  constructor(public tab:Tab, public folder: Tabset) {
  }
}
