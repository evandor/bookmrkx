
interface PersistenceService {

  getServiceName(): string


  cleanUpRequests(): Promise<void>

  compactDb(): Promise<any>

  getActiveFeatures(): Promise<string[]>
  saveActiveFeatures(val: string[]): any

  clear(name: string):any

}

export default PersistenceService
