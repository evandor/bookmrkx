import {Notification} from "src/models/Notification";
import {Suggestion, SuggestionState} from "src/models/Suggestion";

interface PersistenceService {

  getServiceName(): string


  cleanUpRequests(): Promise<void>

  getNotifications(onlyNew: boolean): Promise<Notification[]>
  addNotification(notification: Notification): Promise<any>
  notificationRead(notificationId: string): Promise<void>

  getSuggestions(): Promise<Suggestion[]>
  addSuggestion(suggestion: Suggestion): Promise<any>
  removeSuggestion(id: string): any;
  setSuggestionState(id: string, state: SuggestionState): any;

  compactDb(): Promise<any>

  getActiveFeatures(): Promise<string[]>
  saveActiveFeatures(val: string[]): any

  clear(name: string):any

}

export default PersistenceService
