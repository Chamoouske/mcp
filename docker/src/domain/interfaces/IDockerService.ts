export default interface IDockerService {
  listContainers(all: boolean): Promise<any[]>;
  startContainer(containerId: string): Promise<void>;
  stopContainer(containerId: string): Promise<void>;
  restartContainer(containerId: string): Promise<void>;
  removeContainer(containerId: string, force: boolean): Promise<void>;
  listImages(): Promise<any[]>;
  getContainerLogs(containerId: string, tail: number): Promise<string>;
  execInContainer(containerId: string, cmd: string): Promise<string>;
  pullImage(imageName: string): Promise<void>;
  runContainer(config: ContainerConfig): Promise<string>;
  buildImage(dockerfile: string, tag: string, context: string): Promise<string>;
  composeUp(projectName: string, composeFile: string): Promise<void>;
  composeDown(projectName: string): Promise<void>;
  composePs(projectName: string): Promise<any[]>;
  inspectContainer(containerId: string): Promise<any>;
  inspectImage(imageId: string): Promise<any>;
  getContainerStats(containerId: string): Promise<any>;
  listNetworks(): Promise<any[]>;
  listVolumes(): Promise<any>;
}

export interface ContainerConfig {
  image: string;
  name?: string;
  ports?: string[];
  volumes?: string[];
  env?: string[];
  detached?: boolean;
}