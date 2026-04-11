import Docker from 'dockerode';
import { exec } from 'child_process';
import { promisify } from 'util';
import IDockerService, { ContainerConfig } from '../../domain/interfaces/IDockerService.js';

const execAsync = promisify(exec);

export default class DockerService implements IDockerService {
  private docker: Docker;

  constructor() {
    this.docker = new Docker();
  }

  async listContainers(all: boolean = false): Promise<any[]> {
    return await this.docker.listContainers({ all });
  }

  async startContainer(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    await container.start();
  }

  async stopContainer(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    await container.stop();
  }

  async restartContainer(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    await container.restart();
  }

  async removeContainer(containerId: string, force: boolean = false): Promise<void> {
    const container = this.docker.getContainer(containerId);
    await container.remove({ force });
  }

  async listImages(): Promise<any[]> {
    return await this.docker.listImages();
  }

  async getContainerLogs(containerId: string, tail: number = 100): Promise<string> {
    const container = this.docker.getContainer(containerId);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail,
    });
    return logs.toString();
  }

  async execInContainer(containerId: string, cmd: string): Promise<string> {
    const container = this.docker.getContainer(containerId);
    const execInstance = await container.exec({
      Cmd: cmd.split(' '),
      AttachStdout: true,
      AttachStderr: true,
    });
    const stream: any = await execInstance.start({ hijack: true, stdin: false });
    await new Promise((resolve) => stream.on('end', resolve));
    const output = Buffer.concat(stream.njsStream?.chunks || []);
    return output.toString();
  }

  async pullImage(imageName: string): Promise<void> {
    await new Promise((resolve, reject) => {
      this.docker.pull(imageName, (err, stream) => {
        if (err) return reject(err);
        this.docker.modem.followProgress(stream, (err, output) => {
          if (err) return reject(err);
          resolve(output);
        });
      });
    });
  }

  async runContainer(config: ContainerConfig): Promise<string> {
    const portBindings: any = {};
    if (config.ports) {
      config.ports.forEach((port: string) => {
        const [host, container] = port.split(':');
        portBindings[`${container}/tcp`] = [{ HostPort: host }];
      });
    }

    const binds: string[] = [];
    if (config.volumes) {
      config.volumes.forEach((vol: string) => binds.push(vol));
    }

    const container = await this.docker.createContainer({
      Image: config.image,
      name: config.name,
      Env: config.env,
      HostConfig: {
        PortBindings: Object.keys(portBindings).length > 0 ? portBindings : undefined,
        Binds: binds.length > 0 ? binds : undefined,
      },
    });

    if (config.detached !== false) {
      await container.start();
    }

    return container.id;
  }

  async buildImage(dockerfile: string, tag: string, context: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.docker.buildImage(
        context,
        {
          dockerfile,
          t: tag,
        },
        (err, stream) => {
          if (err) return reject(err);
          this.docker.modem.followProgress(stream, (err, output) => {
            if (err) return reject(err);
            resolve(tag);
          });
        }
      );
    });
  }

  async composeUp(projectName: string, composeFile: string): Promise<void> {
    const cmd = `docker-compose -f "${composeFile}" -p "${projectName}" up -d`;
    await execAsync(cmd);
  }

  async composeDown(projectName: string): Promise<void> {
    const cmd = `docker-compose -p "${projectName}" down`;
    await execAsync(cmd);
  }

  async composePs(projectName: string): Promise<any[]> {
    const { stdout } = await execAsync(`docker-compose -p "${projectName}" ps --format json`);
    try {
      return JSON.parse(stdout || '[]');
    } catch {
      return [{ raw: stdout }];
    }
  }

  async inspectContainer(containerId: string): Promise<any> {
    const container = this.docker.getContainer(containerId);
    return await container.inspect();
  }

  async inspectImage(imageId: string): Promise<any> {
    const image = this.docker.getImage(imageId);
    return await image.inspect();
  }

  async getContainerStats(containerId: string): Promise<any> {
    const container = this.docker.getContainer(containerId);
    const stats = await container.stats({ stream: false });
    return stats;
  }

  async listNetworks(): Promise<any[]> {
    return await this.docker.listNetworks();
  }

  async listVolumes(): Promise<any> {
    return await this.docker.listVolumes();
  }
}