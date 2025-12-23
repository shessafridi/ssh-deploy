import fs from 'fs';
import path from 'path';
import { ServerProfile, DeploymentProfile } from './types';

const baseDir = (process as any).pkg
  ? path.dirname(process.execPath)
  : process.cwd();

const loadJson = <T>(file: string): T => {
  const fullPath = path.join(baseDir, file);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
};

export const loadServerProfiles = (): ServerProfile[] =>
  loadJson<ServerProfile[]>('server_profiles.json');

export const loadDeploymentProfiles = (): DeploymentProfile[] =>
  loadJson<DeploymentProfile[]>('deployment_profiles.json');
