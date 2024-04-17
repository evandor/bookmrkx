export enum SyncMode {
  UNKNOWN = "UNKNOWN",
  ACTIVE= "ACTIVE",
  INACTIVE = "INACTIVE",
  DECLINED = "DECLINED"
}

export class Subscription {

  constructor(
    public created: string,
    public account: string,
    public syncMode?: SyncMode
  ) {
  }


}
