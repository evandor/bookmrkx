import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from "pinia";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {CreateTabsetCommand} from "src/domain/tabsets/CreateTabset";
import {useDB} from "src/services/usePersistenceService";
import {useTabsStore} from "stores/tabsStore";
import PersistenceService from "src/services/PersistenceService";
import {useTabsetService} from "src/services/TabsetService2";
import {AssociateWindowWithTabsetCommand} from "src/domain/tabsets/AssociateWindowWithTabsetCommand";
import {useWindowsStore} from "src/stores/windowsStore";

installQuasarPlugin();

vi.mock('vue-router')

describe('AssociateWindowWithTabsetCommand', () => {

  let db = null as unknown as PersistenceService

  beforeEach(async () => {
    setActivePinia(createPinia())
    await IndexedDbPersistenceService.init("db")
    db = useDB(undefined).db
    await useTabsetService().init(db)
  })

  afterEach(async() => {
    db.clear("tabsets")
  })

  it('command has proper toString representation', async () => {
    const cmd = await new AssociateWindowWithTabsetCommand("tabsetName", "windowName")
    expect(cmd.toString()).toBe("AssociateWindowWithTabsetCommand: {tabsetId=tabsetName, windowName=windowName}")
  })

  it('associates window name with existing tabset', async () => {
    const tsRes = await new CreateTabsetCommand("existingTabset", []).execute()
    const tabsetId = tsRes.result.tabset.id
    const executionResult = await new AssociateWindowWithTabsetCommand(tabsetId, "newWindowName").execute()
    expect(executionResult.result).toBe(tabsetId)
    expect(executionResult.message).toBe("Window set to 'newWindowName'")

    const db = useDB(undefined).db
    await db.loadTabsets()
    const tabsets = useTabsStore().tabsets
    expect(tabsets.size).toBe(1)
    expect(tabsets.get(tabsetId)?.name).toBe("existingTabset")
    expect(tabsets.get(tabsetId)?.window).toBe("newWindowName")

    const windows = useWindowsStore().windowSet
    expect(windows.has("newWindowName")).toBeTruthy()
  });

  // it('fails associating window name with non-existing tabset', async () => {
  //   const executionResult = await new AssociateWindowWithTabsetCommand("tabsetId", "newWindowName").execute()
  //   expect(executionResult).toBe("Window set to 'newWindowName'")
  // });

});
