import { environment } from './environment.js';
export const context = {
    get: () => ({ username: environment.getUsername() })
};
