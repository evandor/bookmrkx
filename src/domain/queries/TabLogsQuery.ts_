import Query from "src/domain/Query";
import {QueryResult} from "src/domain/QueryResult";
import {LogEntry} from "src/models/LogEntry";
import {Predicate} from "src/domain/Types";
import {useDB} from "src/services/usePersistenceService";

const {db} = useDB()

export class TabLogsQuery implements Query<object[]> {

  constructor(public tabUrl: string) {
  }

  query<T>(): Promise<QueryResult<LogEntry[]>> {
    const predicate: Predicate<LogEntry> = (t: LogEntry) => t.context === "url_" + btoa(this.tabUrl)
    return db.getLogs(predicate)
      .then((r) => {
        return new QueryResult(r, "")
      })
  }


}
