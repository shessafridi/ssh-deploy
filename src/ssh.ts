import { Client } from 'ssh2';
import { ServerProfile } from './types';

export const withSSH = (
  server: ServerProfile,
  fn: (conn: Client) => Promise<void>
): Promise<void> =>
  new Promise((resolve, reject) => {
    const conn = new Client();

    conn
      .on('ready', async () => {
        try {
          await fn(conn);
          conn.end();
          resolve();
        } catch (err) {
          conn.end();
          reject(err);
        }
      })
      .on('error', reject)
      .connect({
        host: server.serverIp,
        port: server.sshPort,
        username: server.sshUsername,
        password: server.sshPassword,
      });
  });

export const uploadFile = (
  conn: Client,
  localPath: string,
  remotePath: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      sftp.fastPut(localPath, remotePath, err =>
        err ? reject(err) : resolve()
      );
    });
  });

export const execCommand = (conn: Client, command: string): Promise<void> =>
  new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);

      stream
        .on('close', (code: any) => {
          if (code === 0) resolve();
          else reject(new Error(`Command exited with ${code}`));
        })
        .on('data', (data: any) => process.stdout.write(data))
        .stderr.on('data', data => process.stderr.write(data));
    });
  });
