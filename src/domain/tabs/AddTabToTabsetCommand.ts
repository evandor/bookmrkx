import Command from "src/domain/Command";
import TabsetService from "src/services/TabsetService";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {Tab} from "src/models/Tab";
import _ from "lodash";
import {useTabsStore} from "src/stores/tabsStore";
import {useTabsetService} from "src/services/TabsetService2";
import {Tabset, TabsetSharing} from "src/models/Tabset";
import {useUtils} from "src/services/Utils";
import {useSearchStore} from "stores/searchStore";
import {uid, useQuasar} from "quasar";
import {useGroupsStore} from "stores/groupsStore";
import PlaceholderUtils from "src/utils/PlaceholderUtils";
import {useAuthStore} from "stores/authStore";
import {collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc} from "firebase/firestore";
import FirebaseServices from "src/services/firebase/FirebaseServices";

const {saveTabset} = useTabsetService()
const {sendMsg} = useUtils()

// No undo command, tab can be deleted manually easily

/**
 * Add provided Tab to provided Tabset.
 */
export class AddTabToTabsetCommand implements Command<any> {


  constructor(
    public tab: Tab,
    public tabset: Tabset,
    public activeFolder: string | undefined = undefined) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    const tabsStore = useTabsStore()
    console.info(`adding tab '${this.tab.id}' to tabset '${this.tabset.id}', active folder: ${this.activeFolder}`)
    let tabsetOrFolder = this.tabset
    if (this.activeFolder) {
      const folder = useTabsetService().findFolder(this.tabset.folders, this.activeFolder)
      if (folder) {
        tabsetOrFolder = folder
      }
    }

    const exists = _.findIndex(tabsetOrFolder.tabs, t => t.url === this.tab.url) >= 0
    console.debug("checking 'tab exists' yields", exists)
    if (!exists) {
      try {
        // manage (chrome) Group
        console.log("updating tab group for group id", this.tab.groupId)
        const currentGroup = useGroupsStore().currentGroupForId(this.tab.groupId)
        this.tab.groupName = currentGroup?.title || undefined
        if (currentGroup) {
          await useGroupsStore().persistGroup(currentGroup)
        }

        const tabset: Tabset = await useTabsetService().addToTabset(tabsetOrFolder, this.tab, 0)

        // Analysis
        if (useAuthStore().isAuthenticated() && this.tab.url?.startsWith("https://")) {
          const userId = useAuthStore().user.uid
          setDoc(doc(FirebaseServices.getFirestore(), "users", userId, "queue", uid()),{"event": "new-tab", "url": this.tab.url})
        }

        // Sharing
        if (tabset.sharedId && tabset.sharing === TabsetSharing.PUBLIC_LINK && !this.activeFolder) {
          tabset.sharing = TabsetSharing.PUBLIC_LINK_OUTDATED
          tabset.sharedAt = new Date().getTime()
        }

        // Placeholder Defaults Application
        this.tab = PlaceholderUtils.applyForDefaultDomains(this.tab)

        // the tab has been added to the tabset, but not saved yet
        const content = await TabsetService.getContentFor(this.tab)
        let res: any = null
        if (content) {
          const res2 = await useTabsetService().saveText(this.tab, content['content' as keyof object], content['metas' as keyof object])
          // add to search index
          useSearchStore().addToIndex(
            uid(), this.tab.name || '',
            this.tab.title || '',
            this.tab.url || '',
            this.tab.description, content['content' as keyof object],
            [this.tabset.id],
            this.tab.favIconUrl || '')
          res = new ExecutionResult("result", "Tab was added",)
        } else {
          const res2 = saveTabset(this.tabset)
          useSearchStore().addToIndex(
            uid(), this.tab.name || '',
            this.tab.title || '',
            this.tab.url || '',
            this.tab.description, '',
            [this.tabset.id],
            this.tab.favIconUrl || '')
          res = new ExecutionResult(res2, "Tab was added")
        }
        sendMsg('tab-added', {tabsetId: this.tabset.id})

        return res
      } catch (err) {
        return Promise.reject("error: " + err)
      }
    } else {
      return Promise.reject("tab already exists in this tabset")
    }


  }


}

AddTabToTabsetCommand.prototype.toString = function cmdToString() {
  return `AddTabToTabsetCommand: {tab=${this.tab.toString()}}`;
};
