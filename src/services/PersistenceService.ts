import {Tabset} from "src/models/Tabset";
import {Space} from "src/models/Space";
import {Tab} from "src/models/Tab";
import {Notification} from "src/models/Notification";
import {SearchDoc} from "src/models/SearchDoc";
import {Suggestion, SuggestionState} from "src/models/Suggestion";
import {MetaLink} from "src/models/MetaLink";
import {Window} from "src/models/Window";
import {RequestInfo} from "src/models/RequestInfo";
import {BlobType, SavedBlob} from "src/models/SavedBlob";
import {Message} from "src/models/Message";
import {Account} from "src/models/Account";
import {Entity} from "src/models/Entity";
import {Api} from "src/models/Api";

interface PersistenceService {

  getServiceName(): string


  getRequest(url: string): Promise<string>

  getMetaLinks(url: string): Promise<object>
  saveMetaLinks(url: string, metaLinks: MetaLink[]): Promise<void | IDBValidKey>
  getLinks(url: string): Promise<object>
  saveLinks(url: string, links: any): Promise<void | IDBValidKey>

  getBlobs(type: BlobType): Promise<any[]>
  saveBlob(id: string, url: string, data: Blob, type: BlobType, remark: string | undefined): Promise<any>
  getBlobsForTab(tabId: string): Promise<SavedBlob[]>
  deleteBlob(tabId: string, elementId: string): void;

  saveRequest(url: string, requestInfo: RequestInfo): Promise<void>

  loadSpaces(): Promise<any>

  addSpace(space: Space): Promise<any>
  deleteSpace(spaceId: string): void;

  //loadCategories(): Promise<any>

  cleanUpRequests(): Promise<void>

  getNotifications(onlyNew: boolean): Promise<Notification[]>
  addNotification(notification: Notification): Promise<any>
  notificationRead(notificationId: string): Promise<void>

  getSuggestions(): Promise<Suggestion[]>
  addSuggestion(suggestion: Suggestion): Promise<any>
  removeSuggestion(id: string): any;
  setSuggestionState(id: string, state: SuggestionState): any;

  compactDb(): Promise<any>

  getActiveFeatures(): Promise<string[]>
  saveActiveFeatures(val: string[]): any

  addGroup(group: chrome.tabGroups.TabGroup): Promise<any>
  updateGroup(group: chrome.tabGroups.TabGroup): Promise<any>
  getGroups(): Promise<chrome.tabGroups.TabGroup[]>
  deleteGroupByTitle(title: string): Promise<void>

  addWindow(window: Window): Promise<any>
  //updateWindow(group: chrome.windows.Window): Promise<any>
  getWindows(): Promise<Window[]>
  getWindow(windowId: number): Promise<Window | undefined>
  removeWindow(windowId: number): Promise<void>
  updateWindow(window: Window): Promise<void>
  upsertWindow(window: Window): Promise<void>

  getMessages(): Promise<Message[]>
  addMessage(msg: Message):void

  getAccount(accountId: string): Promise<Account>
  upsertAccount(account: Account):void

  clear(name: string):any


}

export default PersistenceService
