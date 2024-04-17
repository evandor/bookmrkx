import PersistenceService from "src/services/PersistenceService";
import {Space} from "src/models/Space";
import {StaticSuggestionIdent, Suggestion, SuggestionState} from "src/models/Suggestion";
import {SearchDoc} from "src/models/SearchDoc";
import {QVueGlobals, useQuasar} from "quasar";
import {Tabset} from "src/models/Tabset";
import {Tab} from "src/models/Tab";
import {Notification} from "src/models/Notification";
import {MetaLink} from "src/models/MetaLink";
import {RequestInfo} from "src/models/RequestInfo";
import {Window} from "src/models/Window";
import {BlobType, SavedBlob} from "src/models/SavedBlob";
import {Message} from "src/models/Message";
import {Account} from "src/models/Account";
import {Entity} from "src/models/Entity";

export class LocalStoragePersistenceService implements PersistenceService {

  private quasar: QVueGlobals;

  constructor(quasar: QVueGlobals) {
    this.quasar = quasar
  }

  getServiceName(): string { return "LocalStoragePersistenceService" }

  deleteSpace(spaceId: string): void {
    throw new Error("Method not implemented.");
  }

  saveActiveFeatures(val: string[]) {
    if (this.quasar.localStorage) {
      this.quasar.localStorage.set("ui.activeFeatures", val)
    } else {
      console.warn("local storage not defined")
    }
  }

  setInactiveDefaultFeatures(val: string[]) {
    this.quasar.localStorage.set("ui.inActiveDefaultFeatures", val)
  }

  getActiveFeatures(): Promise<string[]> {
    return Promise.resolve(this.quasar.localStorage?.getItem('ui.activeFeatures') as string[] || [])
  }

  getInactiveDefaultFeatures(): Promise<string[]> {
    return Promise.resolve(this.quasar.localStorage?.getItem('ui.inActiveDefaultFeatures') as string[] || [])
  }

  addNotification(notification: Notification): Promise<any> {
    return Promise.resolve(undefined);
  }

  addSpace(space: Space): Promise<any> {
    return Promise.resolve(undefined);
  }

  addSuggestion(suggestion: Suggestion): Promise<any> {
    return Promise.resolve(undefined);
  }

  removeSuggestion(ident: string) {
    throw new Error("Method not implemented.");
  }

  setSuggestionState(id: string, state: SuggestionState) {
    throw new Error("Method not implemented.");
  }

  cleanUpContent(): Promise<SearchDoc[]> {
    return Promise.resolve([]);
  }

  cleanUpRequests(): Promise<void> {
    return Promise.resolve(undefined);
  }

  cleanUpThumbnails(): Promise<void> {
    return Promise.resolve(undefined);
  }

  compactDb(): Promise<any> {
    return Promise.resolve(undefined);
  }

  deleteContent(url: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  deleteTabset(tabsetId: string): Promise<any> {
    return Promise.resolve(undefined);
  }

  cleanUpTabsets(): Promise<void> {
    return Promise.resolve(undefined);
  }

  deleteThumbnail(url: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  getContent(url: string): Promise<object> {
    return Promise.resolve({});
  }

  getContents(): Promise<any[]> {
    return Promise.resolve([]);
  }

  getLinks(url: string): Promise<object> {
    return Promise.resolve({});
  }

  getMHtml(url: string): Promise<object> {
    return Promise.resolve({});
  }

  getMHtmlInline(url: string): Promise<object> {
    return Promise.resolve({});
  }

  getMetaLinks(url: string): Promise<object> {
    return Promise.resolve({});
  }

  getNotifications(onlyNew: boolean): Promise<Notification[]> {
    return Promise.resolve([]);
  }

  getRequest(url: string): Promise<string> {
    return Promise.resolve("");
  }

  getSuggestions(): Promise<Suggestion[]> {
    return Promise.resolve([]);
  }

  getThumbnail(url: string): Promise<string> {
    return Promise.resolve("");
  }

  loadSpaces(): Promise<any> {
    return Promise.resolve(undefined);
  }

  loadTabsets(): Promise<void> {
    return Promise.resolve(undefined);
  }

  notificationRead(notificationId: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  saveContent(tab: Tab, text: string, metas: object, title: string, tabsetIds: string[]): Promise<any> {
    return Promise.resolve(undefined);
  }

  saveMHtml(tab: Tab, mhtml: Blob): Promise<string> {
    return Promise.resolve("");
  }

  saveStats(date: string, dataset: object): void {
  }

  saveTabset(tabset: Tabset): Promise<any> {
    return Promise.resolve(undefined);
  }

  saveThumbnail(tab: chrome.tabs.Tab, thumbnail: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  updateContent(url: string): Promise<object> {
    return Promise.resolve({});
  }

  updateThumbnail(url: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  reloadTabset(tabsetId: string): void {
  }

  clear(name: string) {
  }

  getBlobsForTab(blobId: string): Promise<SavedBlob[]> {
    return Promise.resolve([]);
  }

  saveBlob(id: string, url: string, data: Blob, type: BlobType, remark: string | undefined = undefined): Promise<any> {
    return Promise.resolve(undefined);
  }

  saveLinks(url: string, links: any): Promise<void> {
    return Promise.resolve(undefined);
  }

  saveMetaLinks(url: string, metaLinks: MetaLink[]): Promise<void> {
    return Promise.resolve(undefined);
  }

  saveRequest(url: string, requestInfo: RequestInfo): Promise<void> {
    return Promise.resolve(undefined);
  }

  addGroup(group: chrome.tabGroups.TabGroup): Promise<any> {
    return Promise.resolve(undefined);
  }

  addWindow(window: Window): Promise<any> {
    return Promise.resolve(undefined);
  }

  deleteGroupByTitle(title: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  deleteMHtml(id: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  getGroups(): Promise<chrome.tabGroups.TabGroup[]> {
    return Promise.resolve([]);
  }

  getWindow(windowId: number): Promise<Window | undefined> {
    return Promise.resolve(undefined);
  }

  getWindows(): Promise<Window[]> {
    return Promise.resolve([]);
  }

  removeWindow(windowId: number): Promise<void> {
    return Promise.resolve(undefined);
  }

  updateGroup(group: chrome.tabGroups.TabGroup): Promise<any> {
    return Promise.resolve(undefined);
  }

  updateWindow(window: Window): Promise<void> {
    return Promise.resolve(undefined);
  }

  upsertWindow(window: Window): Promise<void> {
    return Promise.resolve(undefined);
  }

  getBlobs(type: BlobType): Promise<any[]> {
    return Promise.resolve([]);
  }

  deleteBlob(tabId: string, elementId: string): void {
  }

  addMessage(msg: Message): void {
  }

  getMessages(): Promise<Message[]> {
    return Promise.resolve([]);
  }

  getAccount(accountId: string): Promise<Account> {
    return Promise.reject("not implemented")
  }

  upsertAccount(account: Account):void {
    console.warn("not implemented")
  }

  saveEntity (entity: Entity): void {
  }

  findEntityById(id: string): Promise<Entity> {
    return Promise.resolve(new Entity("0","..."));
  }

  getEntities(): Promise<Entity[]> {
    return Promise.resolve([]);
  }

}
