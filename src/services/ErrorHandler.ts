import {Notify} from 'quasar'
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useUiStore} from "stores/uiStore";
import {useLogger} from "src/services/Logger";

export enum NotificationType {
  NOTIFY = "NOTIFY",
  TOAST = "TOAST"
}

export function useNotificationHandler() {

  const {info, error} = useLogger()

  const handleError = (err: any, type: NotificationType = NotificationType.TOAST) => {
    const errorMsg = err ? err.toString() : 'unknown error'
    console.log("showing error message: ", errorMsg)
    console.trace()

    //logtail.error(error ? error.toString() : 'unknown error', error)
    error(errorMsg /** todo pass actual error */)

    switch (type) {
      case NotificationType.NOTIFY:
        Notify.create({
          position: 'bottom',
          color: 'red-5',
          textColor: 'white',
          icon: 'error',
          message: errorMsg
        })
        break;
      default:
        useUiStore().createErrorToast(errorMsg)
    }

  }

  const handleWarning = (res: ExecutionResult<any>) => {
    useUiStore().createWarningToast(res.message)
  }

  const handleSuccess = (executionResult: ExecutionResult<any>, type: NotificationType = NotificationType.TOAST): ExecutionResult<any> => {
    const actions: any[] = []
    if (executionResult.undoCommand) {
      actions.push(
        {
          label: 'Undo', color: 'white',
          handler: () => {
            executionResult.undoCommand?.execute()
              .then((res: any) => handleWarning(res))
              .catch((err: any) => handleError(err))
          }
        }
      )
    }

    switch (type) {
      case NotificationType.NOTIFY:
        Notify.create({
          color: 'positive',
          message: executionResult.message,
          actions: actions
        })
        break;
      default:
        useUiStore().createSuccessToast(executionResult.message, actions[0])
    }
    return executionResult
  }

  return {
    handleError, handleSuccess
  }
}
