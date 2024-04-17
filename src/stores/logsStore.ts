// import {defineStore} from 'pinia';
// import {ref} from "vue";
//
// /**
//  * a pinia store for (error) logs.
//  *
//  */
//
// export const useLogsStore = defineStore('logs', () => {
//
//   //overrideLogs()
//
//   const logs = ref<Array<object>>([])
//   const errors = ref<Array<object>>([])
//   const warnings = ref<Array<object>>([])
//
//   function appendLog(data: object) {
//     logs.value.push(data)
//   }
//
//   function appendWarning(data: object) {
//     warnings.value.push(data)
//   }
//
//   function appendError(data: object) {
//     errors.value.push(data)
//   }
//
//   return {
//     logs,
//     errors,
//     warnings,
//     appendLog,
//     appendWarning,
//     appendError
//   }
// })
