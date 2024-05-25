import Command from "src/core/domain/Command";

export class QueryResult<T> {
  constructor(
    public result: T,
    public message: string) {
  }


}
