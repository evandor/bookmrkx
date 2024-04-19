import {IDBPDatabase, openDB, deleteDB} from "idb";
import _, {intersection} from "lodash";
import {EXPIRE_DATA_PERIOD_IN_MINUTES, INDEX_DB_VERSION} from "boot/constants";
import PersistenceService from "src/services/PersistenceService";
import {uid, useId} from "quasar";
import {Notification, NotificationStatus} from "src/models/Notification";
import {Suggestion, SuggestionState, SuggestionType} from "src/models/Suggestion";
import {useUiStore} from "src/stores/uiStore";

class IndexedDbPersistenceService implements PersistenceService {
  private db: IDBPDatabase = null as unknown as IDBPDatabase

  getServiceName(): string {
    return "IndexedDbPersistenceService"
  }

  async init(dbName: string) {
    console.log(" ...initializing indexeddb database", dbName)
    this.db = await this.initDatabase(dbName)
    useUiStore().dbReady = true
  }

  async deleteDatabase(dbName: string) {
    useUiStore().dbReady = false
    console.warn(" ...deleting indexeddb database: not implemented", dbName)
  }


  deleteTabset(tabsetId: string): Promise<void> {
    return this.db.delete('tabsets', tabsetId)
  }

  async updateContent(url: string): Promise<object> {
    const encodedUrl = btoa(url)

    const objectStore = this.db.transaction("content", "readwrite").objectStore("content");
    let cursor = await objectStore.openCursor()
    let data = null
    while (cursor) {
      if (cursor.value.id === encodedUrl) {
        data = cursor.value
        data['expires'] = 0
        objectStore.put(data, cursor.key)
      }
      cursor = await cursor.continue();
    }
    return Promise.resolve(data)
  }

  async updateThumbnail(url: string): Promise<void> {
    const encodedUrl = btoa(url)
    const tnObjectStore = this.db.transaction("thumbnails", "readwrite").objectStore("thumbnails");
    let tnCursor = await tnObjectStore.openCursor()
    while (tnCursor) {
      //console.log("cursor", tnCursor.value, encodedUrl)
      if (tnCursor.value.expires !== 0 && tnCursor.key === encodedUrl) {
        const data = tnCursor.value
        tnObjectStore.put({
            expires: 0,
            thumbnail: data.thumbnail
          },
          tnCursor.key)
      }
      tnCursor = await tnCursor.continue();
    }
  }

  getRequest(url: string): Promise<string> {
    const encodedUrl = btoa(url)
    return this.db.get('requests', encodedUrl)
  }

  getMetaLinks(url: string): Promise<object> {
    const encodedUrl = btoa(url)
    return this.db.get('metalinks', encodedUrl)
  }

  getLinks(url: string): Promise<object> {
    const encodedUrl = btoa(url)
    return this.db.get('links', encodedUrl)
  }

  addGroup(group: chrome.tabGroups.TabGroup): Promise<any> {
    console.debug("adding group", group)
    return this.db.add('groups', group, group.title)
      .catch((err) => {
        if (!err.toString().indexOf('Key already exists')) {
          console.log("error adding group", group, err)
        }
      })
  }


  /*** Windows Management ***/


  private async initDatabase(dbName: string): Promise<IDBPDatabase> {
    console.debug(" about to initialize indexedDB")
    return await openDB(dbName, INDEX_DB_VERSION, {
      // upgrading see https://stackoverflow.com/questions/50193906/create-index-on-already-existing-objectstore
      upgrade(db) {
        if (!db.objectStoreNames.contains('bookmarks')) {
          console.log("creating db bookmarks")
          let store = db.createObjectStore('bookmarks');
          store.createIndex("expires", "expires", {unique: false});
        }
        if (!db.objectStoreNames.contains('suggestions')) {
          console.log("creating db suggestions")
          db.createObjectStore('suggestions');
        }
      }
    });
  }



  getNotifications(onlyNew: boolean = true): Promise<Notification[]> {
    if (this.db) {
      return this.db.getAll('notifications')
    }
    console.log("db not ready yet, returning empty notification array")
    return Promise.resolve([])
  }

  addNotification(notification: Notification): Promise<void> {
    return this.db.add('notifications', notification, notification.id)
      .then(() => Promise.resolve())
  }

  notificationRead(notificationId: string): Promise<void> {
    const objectStore = this.db.transaction('notifications', 'readwrite').objectStore('notifications');
    return objectStore.get(notificationId)
      .then(res => {
        res.status = NotificationStatus.READ
        res.updated = new Date().getTime()
        objectStore.put(res, notificationId)
      })
  }

  async getSuggestions(): Promise<Suggestion[]> {
    return this.db ? this.db.getAll('suggestions') : Promise.resolve([])
  }

  async addSuggestion(suggestion: Suggestion): Promise<void> {
    const suggestions = await this.getSuggestions()
    // console.log("%csuggestions from db", "color:red", suggestions)
    const foundAsNewDelayedOrIgnored = _.find(suggestions,
      (s: Suggestion) =>
        s.state === SuggestionState.NEW ||
        s.state === SuggestionState.IGNORED ||
        s.state === SuggestionState.DECISION_DELAYED)
    if (foundAsNewDelayedOrIgnored) { // && suggestion.state === SuggestionState.NEW) {
      if (foundAsNewDelayedOrIgnored.state === SuggestionState.IGNORED && suggestion.type === SuggestionType.RESTART) {
        console.log("setting existing restart suggestion to state NEW again")
        foundAsNewDelayedOrIgnored.state = SuggestionState.NEW
        this.db.put('suggestions', foundAsNewDelayedOrIgnored, foundAsNewDelayedOrIgnored.id)
        return Promise.resolve()
      }
      return Promise.reject(`there's already a suggestion in state ${foundAsNewDelayedOrIgnored.state}, not adding (now)`)
    }
    const found = _.find(suggestions, (s: Suggestion) => s.url === suggestion.url)
    if (!found) {
      await this.db.add('suggestions', suggestion, suggestion.id)
      return Promise.resolve()
    }
    return Promise.reject("suggestion already exists")
  }

  removeSuggestion(ident: string): Promise<any> {
    return this.db.delete('suggestions', ident)
  }

  async setSuggestionState(suggestionId: string, state: SuggestionState): Promise<Suggestion> {
    console.log("setting suggestion to state", suggestionId, state)
    const s: Suggestion = await this.db.get('suggestions', suggestionId)
    if (s) {
      s.state = state
      await this.db.put('suggestions', s, suggestionId)
      return Promise.resolve(s)
    }
    return Promise.reject("could not update suggestion")
  }

  compactDb(): Promise<any> {
    return Promise.resolve(undefined);
  }

  clear(name: string) {
    this.db.clear(name).catch((e) => console.warn(e))
  }

  getActiveFeatures(): Promise<string[]> {
    return Promise.reject("not implemented")
  }

  saveActiveFeatures(val: string[]): any {
    console.warn("not implemented")
  }


  cleanUpRequests(): Promise<void> {
    return Promise.resolve(undefined);
  }

  getMessages(): Promise<[]> {
    return Promise.resolve([]);
  }
}

export default new IndexedDbPersistenceService()
