import { DesignContext } from './doc-design.js';
import { environment } from './environment.js';

export const context = {
  get: (): DesignContext => ({ username: environment.getUsername() })
};
