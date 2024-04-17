import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";

export class HeaderDefinition {
  constructor(
    public id: string,
    public name: string,
    public value: string
  ) {

  }
}

export class ParamDefinition {
  constructor(
    public id: string,
    public name: string,
    public value: string
  ) {

  }
}

export class ApiSetup {

  constructor(
    public id: string,
    public url: string,
    public headers: HeaderDefinition[] = [],
    public params: ParamDefinition[] = []
  ) {

  }
}

export class ApiResponse {

  public timestamp: number;

  constructor(
    public id: string,
    public headers: HeaderDefinition[] = [],
    public params: ParamDefinition[] = [],
    public data: object
  ) {
    this.timestamp = new Date().getTime()
  }
}

export class Endpoint {

  constructor(
    public id: string,
    public path: string,
    public headers: HeaderDefinition[] = [],
    public params: ParamDefinition[] = [],
    public results: ApiResponse[] = []
  ) {

  }
}

export class Api {

  public description: string = ''
  public endpoints: Endpoint[] = []
  public setup: ApiSetup | undefined

  constructor(
    public id: string,
    public name: string
  ) {
    this.name = name.replaceAll(STRIP_CHARS_IN_USER_INPUT, '')
  }

}
