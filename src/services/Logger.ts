function log(msg: string, level: number) {
  // no op in bookmrkx
}

export function useLogger() {

  const info = (msg: string) => {
    log(msg, 5)
  }

  const error = (msg: string) => {
    log(msg, 3)
  }

  return {
    info,
    error
  }
}
