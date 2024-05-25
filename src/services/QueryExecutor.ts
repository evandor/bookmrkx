import Command from "src/core/domain/Command";
import {useNotificationHandler} from "src/core/services/ErrorHandler";
import Query from "src/domain/Query";
import {QueryResult} from "src/domain/QueryResult";

const {handleSuccess, handleError} = useNotificationHandler()

export function useQueryExecutor() {

  const queryFromUi = (query: Query<any>): Promise<QueryResult<any>> => {
    //logger.info("running query:", query)
    return query.query()
      // .then(res => handleSuccess(res, logger))
      // .then(res => console.log("command finished"))
      // .catch(err => handleError(err, logger))
  }

  return {
    queryFromUi
  }
}
