import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import TabsetService from "src/services/TabsetService";
import {useUtils} from "src/services/Utils";
import {ListDetailLevel} from "stores/uiStore";
import {useWindowsStore} from "stores/windowsStore";

const {sendMsg} = useUtils()


export class RenameWindowCommand implements Command<string> {

  constructor(
    public windowId: number,
    public newName: string,
    public index: number
  ) {
  }

  async execute(): Promise<ExecutionResult<string>> {

    console.log("setWindowName", this.windowId, this.newName)
    if (this.newName && this.newName.toString().trim().length > 0) {

      const cw = await chrome.windows.get(this.windowId, {populate: true})//,  (cw) => {
      console.log("cw", cw)
      return useWindowsStore().upsertWindow(cw, this.newName.toString().trim(), this.index)
        .then(res => {
          //sendMsg('tabset-renamed', {tabsetId: this.tabsetId, newName: this.newName, newColor: this.newColor})
          return this.newName.toString().trim()
        })
        .then((newName: any) => Promise.resolve(
          new ExecutionResult(
            newName,
            "Window Name Updated"))
        )
        .catch(err => Promise.reject(err))
    }
    return Promise.reject("name was not valid")
  }


}
