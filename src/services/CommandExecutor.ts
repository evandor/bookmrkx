import Command from "src/domain/Command";
import {NotificationType, useNotificationHandler} from "src/services/ErrorHandler";
import {ExecutionResult} from "src/domain/ExecutionResult";

const {handleSuccess, handleError} = useNotificationHandler()

export function useCommandExecutor() {

    const executeFromUi = (command: Command<any>, type: NotificationType = NotificationType.TOAST): Promise<ExecutionResult<any>> => {
        console.log(" * executing command", command)
        return command.execute()
            .then((res) => handleSuccess(res, type))
            .catch(err => {
                console.log("error in command", command)
                handleError(err, type)
                return new ExecutionResult(null, err)
            })
    }

    const execute = (command: Command<any>): Promise<ExecutionResult<any>> => {
        console.log(" * executing command", command)
        return command.execute()
            .catch(err => {
                console.log("error in command", command)
                handleError(err)
                return new ExecutionResult(null, err)
            })
    }

    return {
        executeFromUi,
        execute
    }
}
