export abstract class DocDesign {
  abstract getDesign(): DesignSpec[];
}

export interface DesignSpec {
  amount: number;
  getDoc(): Doc;
  children?: DesignSpec[];
}

export interface Parent {
  _id: string,
  parent?: Record<string, string>
}

export interface Doc {
  _id: string;
  type: string;
  parent?: Parent;
  [key: string]: unknown;
}

export enum DocType {
  dataRecord = 'data_record',
  person = 'person',
}
