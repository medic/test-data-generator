/**
 * Context data provided to the design function.
 */
export type DesignContext = {
  /**
   * The username of the user creating the data.
   */
  username: string;
}

/**
 * Returns a list of design specs that define the desired test data to generate.
 * @param context the context data
 * @returns a list of design specs
 */
export type DocDesign = (context: DesignContext) => DesignSpec[];

/**
 * Design specification for a type of document to generate.
 */
export interface DesignSpec {
  /**
   * Optional. Useful for debugging and to identify if the upload was successful or failed.
   */
  id?: string;

  /**
   * Required. The number of documents of this type to generate. This also servers as the batch size of docs to upload.
   */
  amount: number;

  /**
   * The database to upload the generated documents to. Defaults to `medic`.
   */
  db?: string;

  /**
   * Required. Returns the document to generate. If no `_id` value is provided, one will be generated automatically.
   * This function is called the number of times defined in the `amount` property.
   * @returns the document to generate
   */
  getDoc(): Doc;

  /**
   * Defines the children documents that should be created for the current document type. These children will be
   * automatically linked to their parent document. For reports, the `contact` field will be populated. If the current
   * doc is a `person`, then the `patient_id` and `patient_uuid` fields will be set on the children. Otherwise, the
   * `place_id` and `place_uuid` fields will be set on all child reports. For child contacts, the `parent` field will
   * be automatically populated.
   */
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
