export class SearchDoc {

  created: number
  note: string

  constructor(
    public id: string,
    public name: string,
    public title: string,
    public url: string,
    public description: string,
    public keywords: string,
    public content: string,
    public tabsets: string[],
    public bookmarkId: string,
    public favIconUrl: string) {

    this.created = new Date().getTime()
    this.note = ''

  }
}
