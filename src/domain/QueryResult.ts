import Command from "src/domain/Command";

export class QueryResult<T> {
  constructor(
    public result: T,
    public message: string) {
  }


}
