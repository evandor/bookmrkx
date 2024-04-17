import {SyncType} from "stores/appStore";

export class SyncSettings {

  constructor(
    public type: SyncType | undefined,
    public url: string | undefined,
  ) {
  }
}

export class UserData {
  sync: SyncSettings | undefined
}

export class Account {
  created: number

  constructor(
    public id: string,
    public userData: UserData | undefined,
    public products: string[] = []
  ) {
    this.created = new Date().getTime()
  }

  setProducts(products: string[]) {
    this.products = products
  }
}
