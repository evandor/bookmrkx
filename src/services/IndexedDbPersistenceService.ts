import {IDBPDatabase, openDB, deleteDB} from "idb";
import _ from "lodash";
import {INDEX_DB_VERSION} from "boot/constants";
import PersistenceService from "src/services/PersistenceService";
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
      }
    });
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
