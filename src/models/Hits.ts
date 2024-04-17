import {Hit} from "src/models/Hit";

export class Hits {

  constructor(
    public hits: Hit[],
    public moreHits: boolean
  ) {
  }
}
