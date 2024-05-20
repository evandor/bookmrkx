import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {QVueGlobals, useQuasar} from "quasar";
import {LocalStoragePersistenceService} from "src/services/storage/LocalStoragePersistenceService";
import PersistenceService from "src/services/PersistenceService";
import FeaturesPersistence from "src/features/persistence/FeaturesPersistence";
import IndexedDbFeaturesPersistence from "src/features/persistence/IndexedDbFeaturesPersistence";
import {LocalStorageFeaturesPersistence} from "src/features/persistence/LocalStorageFeaturesPersistence";

export function useDB(quasar: QVueGlobals | undefined = undefined) {

  const db: PersistenceService = IndexedDbPersistenceService

  const featuresIndexedDb: FeaturesPersistence = IndexedDbFeaturesPersistence

  let localDb = undefined as unknown as PersistenceService
  let featuresLocalStorage: FeaturesPersistence = undefined as unknown as FeaturesPersistence
  if (quasar) {
    localDb = new LocalStoragePersistenceService(quasar)
    featuresLocalStorage = new LocalStorageFeaturesPersistence(quasar)
  }

  return {
    db, localDb,
    featuresIndexedDb, featuresLocalStorage
  }

}
