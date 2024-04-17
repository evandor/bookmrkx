import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";

export enum FieldType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  EDITOR = "EDITOR",
  NUMBER = "NUMBER",
  URL = "URL",
  DATE = "DATE",
  FORMULA = "FORMULA",
  REFERENCE = "REFERENCE",
  SUBSTITUTION = "SUBSTITUTION"
}

export class Field {

  constructor(
    public id: string,
    public name: string,
    public type: FieldType,
    public label: string,
    public value: string | number | undefined = undefined,
    public info: string | undefined = undefined,
    public reference: string | undefined = undefined,
    public substitution: string | undefined = undefined
  ) {

  }
}

export class Entity {

  public description: string = ''
  public schema: string = ''
  public items: object[] = []
  public fields: Field[] = []
  public apps: string[] = []
  public labelField: string | undefined = undefined
  public source: string | undefined
  public jsonPath: string | undefined

  constructor(
    public id: string,
    public name: string
  ) {
    this.name = name.replaceAll(STRIP_CHARS_IN_USER_INPUT, '')
  }

}
