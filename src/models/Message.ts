export enum MessageStatus {
  NEW = "NEW",
  READ = "READ"
}

export class Message {
  created: number

  constructor(
    public id: string,
    public status: MessageStatus = MessageStatus.NEW) {
    this.created = new Date().getTime()
  }

}
