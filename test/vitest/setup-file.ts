// This file will be run before each test file
import {INDEX_DB_VERSION} from "boot/constants";
import {useJestHelper} from "src/domain/JestHelper";
import "fake-indexeddb/auto"

const request = indexedDB.open('db', INDEX_DB_VERSION);
request.onupgradeneeded = async function () {
  await useJestHelper().dbInit(request)
}
process.env.MODE = "bex"

// @ts-ignore - needed as 'chrome' is undefined in vitest
global.chrome = undefined

global.CSS = {
  // @ts-ignore
  supports: (k, v) => false,
}
