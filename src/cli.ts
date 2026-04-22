import { Command } from "commander";
import { deploy } from "./deploy";
import { loadDeploymentProfiles, loadServerProfiles } from "./config";
import * as path from "path";

const program = new Command();
program
  .requiredOption("-d, --deploy-profile <name>")
  .option(
    "--profiles-dir <path>",
    "directory containing profile JSONs",
    path.dirname(process.argv[1]),
  )
  .argument("<zip>")
  .action(async (zip, options) => {
    const servers = loadServerProfiles(options.profilesDir);
    const deployments = loadDeploymentProfiles(options.profilesDir);
    const deployment = deployments.find(
      (d) => d.name === options.deployProfile,
    );
    if (!deployment) throw new Error("Deployment profile not found");
    const server = servers.find((s) => s.name === deployment.serverProfile);
    if (!server) throw new Error("Server profile not found");
    console.log("Using server profile:", {
      name: server.name,
      serverIp: server.serverIp,
      sshUsername: server.sshUsername,
      sshPort: server.sshPort,
      rootStyle: server.rootStyle,
    });
    console.log("Using deployment profile:", {
      name: deployment.name,
      serverProfile: deployment.serverProfile,
      zipName: deployment.zipName,
      scriptName: deployment.scriptName,
    });
    await deploy(server, deployment, zip);
    console.log("Deployment completed");
  });
program.parse();
