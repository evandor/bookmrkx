import {QueryResult} from "src/domain/QueryResult";

export default interface Query<T> {

  query(): Promise<QueryResult<T>> //ICommandResponse

}
