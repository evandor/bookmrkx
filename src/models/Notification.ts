import {uid} from "quasar";

export enum NotificationStatus {
  UNREAD = "UNREAD",
  READ = "READ"
}

export class Notification {

  _id: string;
  private created: number;
  updated: number | undefined;
  status: NotificationStatus;

  constructor(public id: string, public title: string, public msg: string) {
    this._id = "notification:" + new Date().toJSON()
    this.created = new Date().getTime()
    this.updated = undefined
    this.status = NotificationStatus.UNREAD
  }

}

export class SharedTabsetNotification extends Notification {
  constructor(public tabsetId: string) {
    super(uid(), "Invitation to Shared Tabset", "shared message inviation");
  }
}

