import { Command } from 'commander';
import { deploy } from './deploy';
import { loadDeploymentProfiles, loadServerProfiles } from './config';

const program = new Command();

program
  .requiredOption('-s, --server-profile <name>')
  .requiredOption('-d, --deploy-profile <name>')
  .argument('<zip>')
  .action(async (zip, options) => {
    const servers = loadServerProfiles();
    const deployments = loadDeploymentProfiles();

    const deployment = deployments.find(d => d.name === options.deployProfile);
    if (!deployment) throw new Error('Deployment profile not found');

    const server = servers.find(s => s.name === options.serverProfile);
    if (!server) throw new Error('Server profile not found');

    if (deployment.serverProfile !== server.name) {
      throw new Error('Deployment profile does not match server profile');
    }

    console.log('Using server profile:', {
      name: server.name,
      serverIp: server.serverIp,
      sshUsername: server.sshUsername,
      sshPort: server.sshPort,
      rootStyle: server.rootStyle,
    });
    console.log('Using deployment profile:', {
      name: deployment.name,
      serverProfile: deployment.serverProfile,
      zipName: deployment.zipName,
      scriptName: deployment.scriptName,
    });

    await deploy(server, deployment, zip);
    console.log('Deployment completed');
  });

program.parse();
