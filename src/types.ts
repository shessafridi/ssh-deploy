export interface ServerProfile {
  name: string;
  serverIp: string;
  sshUsername: string;
  sshPassword: string;
  sshPort: number;
  rootStyle: 'sudoSu' | 'suRoot';
  rootPassword: string;
}

export interface DeploymentProfile {
  name: string;
  serverProfile: string;
  zipName: string;
  scriptName: string;
}
