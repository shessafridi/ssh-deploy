import { ServerProfile, DeploymentProfile } from './types';
import { withSSH, uploadFile, execCommand } from './ssh';

export const deploy = async (
  server: ServerProfile,
  deployment: DeploymentProfile,
  zipPath: string
) => {
  const homeDir = `/home/${server.sshUsername}`;
  const remoteZipPath = `${homeDir}/${deployment.zipName}.zip`;

  await withSSH(server, async conn => {
    console.log('Uploading zip...');
    await uploadFile(conn, zipPath, remoteZipPath);

    console.log('Running deployment script as root...');

    let rootCmd = '';
    if (server.rootStyle === 'sudoSu') {
      rootCmd = `
echo "${server.rootPassword}" | sudo -S bash -c '
cd ${homeDir} &&
chmod +x ${deployment.scriptName} &&
./${deployment.scriptName}
'
`;
    } else {
      rootCmd = `
su - root -c "
cd ${homeDir} &&
chmod +x ${deployment.scriptName} &&
./${deployment.scriptName}
" <<EOF
${server.rootPassword}
EOF
`;
    }

    await execCommand(conn, rootCmd);
  });
};
