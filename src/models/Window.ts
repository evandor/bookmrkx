import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {TABSET_NAME_MAX_LENGTH} from "src/models/Tabset";

export class Window {
  created: number

  constructor(
    public id: number,
    public browserWindow: chrome.windows.Window | undefined,
    public title: string | undefined = undefined,
    public index: number = 0,
    public open = false,
    public hostList: string[] = []) { // could not use sets due to issues

    if (!Window.nameIsShortEnough) {
      throw new Error(`Window name '${name}' is too long`)
    }

    this.created = new Date().getTime()

    this.title = this.title?.replace(STRIP_CHARS_IN_USER_INPUT, '')
  }

  static nameIsShortEnough = (val: string) => val ? val.length <= TABSET_NAME_MAX_LENGTH : true

}

Window.prototype.toString = function tabToString() {
  return `Window: {id=${this.id}, browserWindow=${this.browserWindow !== undefined}, title=${this.title}, index=${this.index}, open=${this.open}, #hostList=${this.hostList.length}}`;
};
