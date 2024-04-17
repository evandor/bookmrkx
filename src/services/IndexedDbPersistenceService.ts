import {IDBPDatabase, openDB, deleteDB} from "idb";
import _, {intersection} from "lodash";
import {EXPIRE_DATA_PERIOD_IN_MINUTES, INDEX_DB_VERSION} from "boot/constants";
import PersistenceService from "src/services/PersistenceService";
import {Tabset, TabsetStatus} from "src/models/Tabset";
import {Space} from "src/models/Space";
import {Tab} from "src/models/Tab";
import {SearchDoc} from "src/models/SearchDoc";
import {MetaLink} from "src/models/MetaLink";
import {uid, useId} from "quasar";
import {Notification, NotificationStatus} from "src/models/Notification";
import {Suggestion, SuggestionState, SuggestionType} from "src/models/Suggestion";
import {useUiStore} from "src/stores/uiStore";
import {RequestInfo} from "src/models/RequestInfo";
import {useSuggestionsStore} from "stores/suggestionsStore";
import {Window} from "src/models/Window";
import {BlobType, SavedBlob} from "src/models/SavedBlob";
import {Message} from "src/models/Message";
import {Account} from "src/models/Account";
import {Entity} from "src/models/Entity";
import {Api} from "src/models/Api";
import * as console from "node:console";
import * as console from "node:console";
import * as url from "node:url";
import {data} from "autoprefixer";
import * as url from "node:url";
import * as console from "node:console";
import * as console from "node:console";
import * as url from "node:url";
import * as url from "node:url";
import * as console from "node:console";
import * as console from "node:console";
import * as url from "node:url";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as url from "node:url";
import * as url from "node:url";
import * as console from "node:console";
import * as console from "node:console";
import * as url from "node:url";
import * as url from "node:url";
import * as console from "node:console";
import * as url from "node:url";
import * as url from "node:url";
import * as url from "node:url";
import * as url from "node:url";
import * as url from "node:url";
import * as url from "node:url";
import * as url from "node:url";
import * as console from "node:console";
import firebase from "firebase/compat";
import Blob = firebase.firestore.Blob;
import * as url from "node:url";
import * as console from "node:console";
import * as console from "node:console";
import {b} from "vitest/dist/suite-ynYMzeLu";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import {store} from "quasar/wrappers";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import * as console from "node:console";
import {s} from "vitest/dist/reporters-LqC_WI4d";
import * as console from "node:console";
import * as console from "node:console";
import {name} from "axios";
import * as console from "node:console";
import {e} from "mathjs";
import * as console from "node:console";
import {api} from "boot/axios";

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

  saveThumbnail(tab: chrome.tabs.Tab, thumbnail: string): Promise<void> {
    if (tab.url) {
      const encodedTabUrl = btoa(tab.url)
      return this.db.put('thumbnails', {
        expires: new Date().getTime() + 1000 * 60 * EXPIRE_DATA_PERIOD_IN_MINUTES,
        thumbnail: thumbnail
      }, encodedTabUrl)
        .then(() => console.debug(new Tab(uid(), tab), `saved thumbnail for url ${tab.url}, ${Math.round(thumbnail.length / 1024)}kB`))
        .catch(err => console.error(new Tab(uid(), tab), err))
    }
    return Promise.reject("no url provided or db not ready")
  }

  saveRequest(url: string, requestInfo: RequestInfo): Promise<void> {
    const encodedTabUrl = btoa(url)
    return this.db.put('requests', {
      expires: new Date().getTime() + 1000 * 60 * EXPIRE_DATA_PERIOD_IN_MINUTES,
      url: url,
      requestInfo
    }, encodedTabUrl)
      .then(() => {
        console.debug("added request", requestInfo)
        if (requestInfo.statusCode.toString().startsWith("30") && requestInfo.headers.length > 0) {
          const suggestionId = uid()
          const suggestion = new Suggestion(suggestionId,
            "Tab URL changed", "A tab's URL has changed according to the server. Should the url be updated?",
            "/suggestions/" + suggestionId,
            SuggestionType.REDIRECT_HAPPENED_FOR_BOOKMARK)
          let location = undefined
          requestInfo.headers.forEach(headerObject => {
            //console.log("checking", headerObject.name.toLowerCase())
            if (headerObject.name.toLowerCase() === 'location') {
              location = headerObject.value
            }
          })
          console.log("location", location)
          if (location) {
            suggestion.setData({
              url,
              status: requestInfo.statusCode,
              location
            })
            useSuggestionsStore().addSuggestion(suggestion).catch((err) => {
              console.log("got error", err)
            })
          }
        }
      })
      .catch(err => console.log("err", err))
  }

  saveMetaLinks(url: string, metaLinks: MetaLink[]): Promise<void | IDBValidKey> {
    if (!this.db) {
      console.log("saveMetaLinks: db not ready yet")
    }
    const encodedTabUrl = btoa(url)
    return this.db.put('metalinks', {
      expires: new Date().getTime() + 1000 * 60 * EXPIRE_DATA_PERIOD_IN_MINUTES,
      url: url,
      metaLinks
    }, encodedTabUrl)
      //.then(() => console.debug("added meta links"))
      .catch(err => console.log("err", err))
  }

  saveLinks(url: string, links: any): Promise<void | IDBValidKey> {
    if (!this.db) {
      console.log("saveLinks: db not ready yet")
    }
    const encodedTabUrl = btoa(url)
    return this.db.put('links', {
      expires: new Date().getTime() + 1000 * 60 * EXPIRE_DATA_PERIOD_IN_MINUTES,
      url: url,
      links
    }, encodedTabUrl)
      //.then(() => console.debug("added links"))
      .catch(err => console.log("err", err))
  }

  getThumbnail(url: string): Promise<string> {
    const encodedUrl = btoa(url)
    return this.db.get('thumbnails', encodedUrl)
  }

  getRequest(url: string): Promise<string> {
    const encodedUrl = btoa(url)
    return this.db.get('requests', encodedUrl)
  }

  getContent(url: string): Promise<object> {
    const encodedUrl = btoa(url)
    if (this.db) {
      return this.db.get('content', encodedUrl)
    }
    return Promise.reject("db not ready (yet)")
  }

  deleteThumbnail(url: string): Promise<void> {
    return this.db.delete('thumbnails', btoa(url))
  }

  deleteContent(url: string): Promise<void> {
    return this.db.delete('content', btoa(url))
  }

  saveContent(tab: Tab, text: string, metas: object, title: string, tabsetIds: string[]): Promise<IDBValidKey> {
    if (tab.url) {
      const encodedTabUrl = btoa(tab.url)
      return this.db.put('content', {
        id: encodedTabUrl,
        expires: new Date().getTime() + 1000 * 60 * EXPIRE_DATA_PERIOD_IN_MINUTES,
        title,
        url: tab.url,
        content: text,
        metas: metas,
        tabsets: tabsetIds,
        favIconUrl: tab.favIconUrl
      }, encodedTabUrl)
        .then((res) => {
          // console.info(new Tab(uid(), tab), "saved content for url " + tab.url)
          return res
        })
    }
    return Promise.reject("tab.url missing")
  }

  getMetaLinks(url: string): Promise<object> {
    const encodedUrl = btoa(url)
    return this.db.get('metalinks', encodedUrl)
  }

  getLinks(url: string): Promise<object> {
    const encodedUrl = btoa(url)
    return this.db.get('links', encodedUrl)
  }

  async cleanUpTabsets(): Promise<void> {
    const objectStore = this.db.transaction("tabsets", "readwrite").objectStore("tabsets");
    let cursor = await objectStore.openCursor()
    while (cursor) {
      if (cursor.value.status === TabsetStatus.DELETED) {
        console.log("cleanup: deleteing stale tabset", cursor.key)
        objectStore.delete(cursor.key)
      }
      cursor = await cursor.continue();
    }
  }

  getContents(): Promise<any[]> {
    return this.db.getAll('content')
  }

  async saveBlob(id: string, url: string, data: Blob, type: BlobType, remark: string | undefined = undefined): Promise<any> {
    //const encodedTabUrl = btoa(tab.url)
    const existing = await this.db.get('blobs', id)
    const arrayToSave: object[] = []
    const savedBlob = new SavedBlob(uid(), type, url, data, remark)
    if (existing) {
      existing.push(savedBlob)
      return this.db.put('blobs', existing, id)
    } else {
      return this.db.put('blobs', [savedBlob], id)
    }
  }

  getBlobs(type: BlobType): Promise<any[]> {
    if (!this.db) { // can happen for some reason
      return Promise.resolve([])
    }
    try {
      console.log("hier", type)
      return this.db.getAll('blobs')
        .then((b: any[]) => {
          console.log("got b", b)
          const blobs = _.flatten(b)
          return _.filter(blobs, d => d.type === type)
        })
    } catch (ex) {
      console.log("got error in getBlobs", ex)
      return Promise.reject("got error in getBlobs")
    }
  }

  getBlobsForTab(tabId: string): Promise<SavedBlob[]> {
    if (!this.db) { // can happen for some reason
      return Promise.resolve([])
    }
    return this.db.get('blobs', tabId)
  }

  async deleteBlob(tabId: string, elementId: string) {
    let blobsForTab = await this.getBlobsForTab(tabId)
    blobsForTab = _.filter(blobsForTab, b => b.id !== elementId)
    await this.db.put('blobs', blobsForTab, tabId)
  }

  async addSpace(space: Space): Promise<void> {
    return await this.db.put('spaces', space, space.id)
      .then(() => Promise.resolve())
  }

  deleteSpace(spaceId: string): Promise<void> {
    return this.db.delete('spaces', spaceId)
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

  updateGroup(group: chrome.tabGroups.TabGroup): Promise<any> {
    console.log("updating group", group)
    return this.db.put('groups', group, group.title)
  }

  getGroups(): Promise<chrome.tabGroups.TabGroup[]> {
    return this.db.getAll('groups')
  }

  async deleteGroupByTitle(title: string): Promise<void> {
    return this.db.delete('groups', title)
  }

  /*** Windows Management ***/

  async addWindow(window: Window): Promise<any> {
    console.debug("adding window", `id=${window.id}, index=${window.index}, #hostList=${window.hostList.length}`)
    const existingWindowForWindowId: Window | undefined = await this.db.get('windows', window.id)
    if (existingWindowForWindowId) {

      const mergedWindow = new Window(
        window.id,
        window.browserWindow,
        existingWindowForWindowId.title,
        existingWindowForWindowId.index,
        existingWindowForWindowId.open,
        window.hostList
      )
      console.debug(`merging windows to ${mergedWindow.toString()}`)
      this.db.put('windows', mergedWindow, window.id).catch((err) => console.error("error", err))
      return Promise.resolve("not added, updated hostList instead")

      // not bad, simply resolve
      //console.debug("key already exists")
      //return Promise.resolve("Key already exists")
    }
    //if (!window.title) {
    // try to find matching window
    const allWindows: Window[] = await this.db.getAll('windows') as Window[]
    console.debug(`adding ${window.toString()} to list [${_.join(_.map(allWindows, w => w.id), ',')}]`)
    for (const w of allWindows) {
      if (w.hostList) {
        console.log("comparing hostLists", window.hostList, w.hostList, typeof w.hostList)
        const intersection = new Set([...window.hostList].filter(x => (new Set(w.hostList).has(x))));
        console.log("intersection", intersection, intersection.size === window.hostList.length, intersection.size === w.hostList.length)
        if (intersection.size === window.hostList.length && intersection.size === w.hostList.length) {
          // reuse existing
          const useId = window.id
          const oldId = w.id
          window = w
          window.id = useId
          console.log("replacing old window " + oldId + " with " + window.toString())
          await this.db.delete('windows', oldId)
          break
        }
      }
    }
    //}
    try {
      await this.db.add('windows', window, window.id)
    }
      //.then((res) => console.log("got res", res))
    catch (err: any) {
      if (!err.toString().indexOf('Key already exists')) {
        console.log("error adding window", window, err)
      }
    }
  }

  // updateGroup(group: chrome.tabGroups.TabGroup): Promise<any> {
  //   console.log("updating group", group)
  //   return this.db.put('groups', group, group.title)
  // }

  getWindows(): Promise<Window[]> {
    return this.db.getAll('windows')
  }

  getWindow(windowId: number): Promise<Window | undefined> {
    //console.log("trying to get window with id", windowId)
    return this.db.get('windows', windowId)
  }

  async removeWindow(windowId: number): Promise<void> {
    console.log("removing window", windowId)
    return this.db.delete('windows', windowId)
  }

  async updateWindow(window: Window): Promise<void> {
    console.debug(`updating window id=${window.id}, title=${window.title}, index=${window.index}, #hostList=${window.hostList?.length}`)
    if (!window.id) {
      return Promise.reject("window.id not set")
    }
    const windowFromDb: Window = await this.db.get('windows', window.id)
    if (!windowFromDb) {
      return Promise.reject("could not find window for id " + window.id)
    }
    const asJson = JSON.parse(JSON.stringify(window))

    asJson['title'] = window.title
    asJson['index'] = window.index
    asJson['hostList'] = window.hostList ? Array.from(window.hostList) : []

    delete asJson['tabs']
    //console.debug("saving window json as ", asJson)
    await this.db.put('windows', asJson, window.id)
  }

  async upsertWindow(window: Window): Promise<void> {
    try {
      console.log(`about to change window:  id=${window.id}, title=${window.title}, index=${window.index}, open=${window.open}, #hostList=${window.hostList.length}`)
      const asJson = JSON.parse(JSON.stringify(window))
      delete asJson['tabs']
      await this.db.put('windows', asJson, window.id)
    } catch (err) {
      console.log("error renaming window", err)
    }
  }

  /** messages **/

  getMessages(): Promise<Message[]> {
    return this.db.getAll('messages')
  }

  addMessage(msg: Message) {
    this.db.put('messages', msg, msg.id)
  }

  private async initDatabase(dbName: string): Promise<IDBPDatabase> {
    console.debug(" about to initialize indexedDB")
    return await openDB(dbName, INDEX_DB_VERSION, {
      // upgrading see https://stackoverflow.com/questions/50193906/create-index-on-already-existing-objectstore
      upgrade(db) {
        if (!db.objectStoreNames.contains('tabsets')) {
          console.log("creating db tabsets")
          db.createObjectStore('tabsets');
        }
        /*        if (!db.objectStoreNames.contains('tabs')) {
                  console.log("creating db tabs")
                  db.createObjectStore('tabs');
                }*/
        if (!db.objectStoreNames.contains('thumbnails')) {
          console.log("creating db thumbnails")
          let store = db.createObjectStore('thumbnails');
          store.createIndex("expires", "expires", {unique: false});
        }
        if (!db.objectStoreNames.contains('content')) {
          console.log("creating db content")
          let store = db.createObjectStore('content');
          store.createIndex("expires", "expires", {unique: false});
        }
        if (!db.objectStoreNames.contains('spaces')) {
          console.log("creating db spaces")
          db.createObjectStore('spaces');
        }
        if (!db.objectStoreNames.contains('mhtml')) {
          console.log("creating db mhtml")
          db.createObjectStore('mhtml');
        }
        if (!db.objectStoreNames.contains('requests')) {
          console.log("creating db requests")
          let store = db.createObjectStore('requests');
          store.createIndex("expires", "expires", {unique: false});
        }
        if (!db.objectStoreNames.contains('metalinks')) {
          console.log("creating db metalinks")
          const store = db.createObjectStore('metalinks');
          store.createIndex("expires", "expires", {unique: false});
        }
        if (!db.objectStoreNames.contains('links')) {
          console.log("creating db links")
          const store = db.createObjectStore('links');
          store.createIndex("expires", "expires", {unique: false});
        }
        if (!db.objectStoreNames.contains('notifications')) {
          console.log("creating db notifications")
          db.createObjectStore('notifications');
        }
        if (!db.objectStoreNames.contains('suggestions')) {
          console.log("creating db suggestions")
          db.createObjectStore('suggestions');
        }
        if (!db.objectStoreNames.contains('blobs')) {
          console.log("creating blobs suggestions")
          db.createObjectStore('blobs');
        }
        if (!db.objectStoreNames.contains('groups')) {
          console.log("creating db groups")
          db.createObjectStore('groups');
        }
        if (!db.objectStoreNames.contains('windows')) {
          console.log("creating db windows")
          db.createObjectStore('windows');
        }
        if (!db.objectStoreNames.contains('messages')) {
          console.log("creating db messages")
          db.createObjectStore('messages');
        }
        if (!db.objectStoreNames.contains('accounts')) {
          console.log("creating db accounts")
          db.createObjectStore('accounts');
        }
        if (!db.objectStoreNames.contains('entities')) {
          console.log("creating db entities")
          db.createObjectStore('entities');
        }
        if (!db.objectStoreNames.contains('apis')) {
          console.log("creating db apis")
          db.createObjectStore('apis');
        }
      },
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

  async getAccount(accountId: string): Promise<Account> {
    return await this.db.get('accounts', accountId)
  }

  upsertAccount(account: Account): void {
    const normalizedAccount = JSON.parse(JSON.stringify(account))
    //console.log("upserting account", account)
    //console.log("upserting account", normalizedAccount)
    this.db.put('accounts', normalizedAccount, normalizedAccount.id)
  }

  saveEntity(entity: Entity): void {
    this.db.put('entities', entity, entity.id)
  }

  deleteEntity(entityId: string): Promise<void> {
    return this.db.delete('entities', entityId)
  }

  async getEntities(): Promise<Entity[]> {
    return await this.db.getAll('entities')
  }

  async findEntityById(id: string) {
    return await this.db.get('entities', id)
  }

  saveApi(api: Api): void {
    this.db.put('apis', api, api.id)
  }

  deleteApi(apiId: string): Promise<void> {
    return this.db.delete('apis', apiId)
  }

  async getApis(): Promise<Api[]> {
    return await this.db.getAll('apis')
  }

  async findApiById(id: string) {
    return await this.db.get('apis', id)
  }

  cleanUpRequests(): Promise<void> {
    return Promise.resolve(undefined);
  }

  loadSpaces(): Promise<any> {
    return Promise.resolve(undefined);
  }
}

export default new IndexedDbPersistenceService()
