import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {QVueGlobals, useQuasar} from "quasar";
import {LocalStoragePersistenceService} from "src/services/storage/LocalStoragePersistenceService";
import PersistenceService from "src/services/PersistenceService";

export function useDB(quasar: QVueGlobals | undefined = undefined) {

  const db: PersistenceService = IndexedDbPersistenceService
  var localDb = undefined as unknown as PersistenceService
  if (quasar) {
    localDb = new LocalStoragePersistenceService(quasar)
  }

  return {
    db, localDb
  }

}
