import PersistenceService from "src/services/PersistenceService";
import {StaticSuggestionIdent, Suggestion, SuggestionState} from "src/models/Suggestion";
import {QVueGlobals, useQuasar} from "quasar";
import {Notification} from "src/models/Notification";

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

  addSuggestion(suggestion: Suggestion): Promise<any> {
    return Promise.resolve(undefined);
  }

  removeSuggestion(ident: string) {
    throw new Error("Method not implemented.");
  }

  setSuggestionState(id: string, state: SuggestionState) {
    throw new Error("Method not implemented.");
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


  clear(name: string) {
  }


}
