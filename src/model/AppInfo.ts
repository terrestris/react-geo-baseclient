export interface AppInfo {
  version: string;
  buildTime: string;
  userId: number;
  commitHash: string;
  authorities: string[];
  appName?: string;
}
