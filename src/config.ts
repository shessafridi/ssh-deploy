import fs from "fs";
import path from "path";
import { ServerProfile, DeploymentProfile } from "./types";

const loadJson = <T>(file: string, dir: string): T => {
  const fullPath = path.join(dir, file);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
};

export const loadServerProfiles = (dir: string): ServerProfile[] =>
  loadJson<ServerProfile[]>("server_profiles.json", dir);

export const loadDeploymentProfiles = (dir: string): DeploymentProfile[] =>
  loadJson<DeploymentProfile[]>("deployment_profiles.json", dir);
