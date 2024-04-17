// export default interface Types {

import {Tab} from "src/models/Tab";

export type Programmer = {
  name: string;
  knownFor: string[];
};

export type TabPredicate = (t: Tab) => boolean;
export type Predicate<T> = (t: T) => boolean;

