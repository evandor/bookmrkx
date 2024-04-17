export enum PlaceholdersType {
  URL_SUBSTITUTION = "URL_SUBSTITUTION"
}


export class Placeholders {


  constructor(
    public type: PlaceholdersType,
    public templateId: string,
    public config: object = {}) {
  }
}
