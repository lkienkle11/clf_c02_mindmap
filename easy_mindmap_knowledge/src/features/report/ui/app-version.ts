// A named import lets the bundler keep only `version`, not the rest of package.json.
import { version } from '../../../../package.json';

/** The app version for report metadata. package.json and src-tauri/tauri.conf.json are released together. */
export const APP_VERSION: string = version;
