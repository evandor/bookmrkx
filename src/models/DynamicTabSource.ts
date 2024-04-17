export enum DynamicTabSourceType {
  WIKIPEDIA = "WIKIPEDIA",
  TAG = "TAG"
}


export class DynamicTabSource {


  constructor(
    public type: DynamicTabSourceType,
    public config: object = {}) {
  }
}
