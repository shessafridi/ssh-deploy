## SFTP Deploy CLI

Small Node/TypeScript utility to upload a deployment zip to a remote Linux server over SSH/SFTP and execute a provided deployment script as root.

### Prerequisites

- Node.js 18+ (used both for development and runtime).
- Remote host reachable via password-based SSH.
- `server_profiles.json` and `deployment_profiles.json` present alongside the compiled output/binary (the CLI reads from the working directory in dev, or the executable directory when packaged).

### Installation

- `npm install`
- `npm run build` to emit compiled files to `dist/`.

### Configuration

Two JSON files define targets and deployments:

- `server_profiles.json`

  - `name`: string identifier.
  - `serverIp`: hostname or IP.
  - `sshUsername` / `sshPassword`: SSH credentials.
  - `sshPort`: SSH port (number).
  - `rootStyle`: `"sudoSu"` (echo password to sudo) or `"suRoot"` (use `su - root`).
  - `rootPassword`: password used for the root escalation method.

- `deployment_profiles.json`
  - `name`: string identifier.
  - `serverProfile`: matches a `server_profiles.json` entry.
  - `zipName`: remote filename (without `.zip`) to place in the user’s home.
  - `scriptName`: script to execute after upload (expected to live in the user’s home).

Example snippets:

```json
[
  {
    "name": "prod-server",
    "serverIp": "203.0.113.10",
    "sshUsername": "deploy",
    "sshPassword": "********",
    "sshPort": 22,
    "rootStyle": "sudoSu",
    "rootPassword": "********"
  }
]
```

```json
[
  {
    "name": "prod-app",
    "serverProfile": "prod-server",
    "zipName": "release",
    "scriptName": "deploy.sh"
  }
]
```

### Usage

Run after building (or against `ts-node` in dev):

- `node dist/cli.js -s <serverProfile> -d <deploymentProfile> <zip>`

Flags/args:

- `-s, --server-profile <name>`: server profile to use.
- `-d, --deploy-profile <name>`: deployment profile to use.
- `<zip>`: path to the local zip file to upload.

What happens:

1. Profile files are loaded. The deployment profile must reference the chosen server profile.
2. Zip is uploaded to `/home/<sshUsername>/<zipName>.zip`.
3. Deployment script is executed as root using the selected `rootStyle`.

### Packaging

- `npm run pkg` builds TypeScript and creates a self-contained executable (`dist/deploy.exe` by default). Ensure the profile JSON files are copied next to the binary.

### Notes & Safety

- Passwords are read from the profile files; store and distribute them securely.
- The root password is echoed into shell commands—limit access to the executable and config files.
- Scripts run as root; review deployment scripts carefully before use.

### Quick Start (end-to-end)

1. Clone: `git clone https://github.com/shessafridi/ssh-deploy.git`
2. Install deps: `npm install`
3. Build executable: `npm run pkg` (outputs `dist/deploy.exe`)
4. (Optional) Add the executable directory to your PATH for easy use.
5. Create `server_profiles.json` and `deployment_profiles.json` **next to the executable**. Example contents:

```json
[
  {
    "name": "dev-server",
    "serverIp": "203.0.113.10",
    "sshUsername": "deploy",
    "sshPassword": "ssh-pass",
    "sshPort": 22,
    "rootStyle": "sudoSu",
    "rootPassword": "root-pass"
  }
]
```

```json
[
  {
    "name": "dev-app",
    "serverProfile": "dev-server",
    "zipName": "release",
    "scriptName": "deploy.sh"
  }
]
```

6. Run the CLI (from the directory containing the executable and the JSON files):  
   `./dist/deploy.exe -s dev-server -d dev-app ./release.zip`
