import {defineStore} from 'pinia';
import {ref} from "vue";
import PersistenceService from "src/services/PersistenceService";
import {useUtils} from "src/services/Utils";
import {Window} from "src/models/Window";
import {Message} from "src/models/Message"

/**
 * a pinia store for "Messages".
 *
 * Elements are persisted to the storage provided in the initialize function
 */

let storage: PersistenceService = null as unknown as PersistenceService

export const useMessagesStore = defineStore('messages', () => {

  const {inBexMode} = useUtils()

  const messages = ref<Map<number, Window>>(new Map())

  /**
   * initialize store with
   * @param ps a persistence storage
   */
  async function initialize(providedDb: PersistenceService) {
    console.debug(" ...initializing messagesStore")
    storage = providedDb
    setup("initialization")
  }

  function setup(trigger: string = "") {
    if (!inBexMode()) {
      return
    }
    storage.getMessages()
      .then((ms) => messages.value = ms)
  }

  function getMessages(): Promise<Message[]> {
    if (!storage) {
      console.log("getMessages: storage not ready yet")
      return Promise.resolve([])
    }
    return storage.getMessages()
  }

  async function addMessage(msg: Message) {
    storage.addMessage(msg)
  }

  async function onUpdate(windowId: number) {
  }


  return {
    initialize,
    getMessages,
    addMessage

  }
})
