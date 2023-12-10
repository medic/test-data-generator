export abstract class DocDesign {
  abstract getDesign(): DesignSpec[];
}

export interface DesignSpec {
  amount: number;
  getDoc(): Doc;
  children?: DesignSpec[];
}

interface Doc {
  _id: string;
  type: string;
  [key: string]: unknown;
}

export enum DocType {
  dataRecord = 'data_record',
  person = 'person',
}
