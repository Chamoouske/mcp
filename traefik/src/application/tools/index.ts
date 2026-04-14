import { ITraefikService, Router, Middleware } from '../../domain/interfaces/ITraefikService.js';

export class RouterTools {
  constructor(private traefikService: ITraefikService) {}

  async listRouters() {
    const routers = await this.traefikService.getRouters();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(routers, null, 2),
        },
      ],
    };
  }

  async getRouter(args: { name: string }) {
    const router = await this.traefikService.getRouter(args.name);
    if (!router) {
      return {
        content: [
          {
            type: 'text',
            text: `Router ${args.name} not found`,
          },
        ],
      };
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(router, null, 2),
        },
      ],
    };
  }

  async createRouter(args: {
    name: string;
    rule: string;
    service: string;
    middlewares?: string[];
    tls?: { certResolver?: string };
  }) {
    const router: Router = {
      name: args.name,
      rule: args.rule,
      service: args.service,
      middlewares: args.middlewares,
      tls: args.tls,
    };
    await this.traefikService.createRouter(router);
    return {
      content: [
        {
          type: 'text',
          text: `Router ${args.name} created successfully`,
        },
      ],
    };
  }

  async updateRouter(args: {
    name: string;
    rule?: string;
    service?: string;
    middlewares?: string[];
    tls?: { certResolver?: string };
  }) {
    await this.traefikService.updateRouter(args.name, {
      rule: args.rule,
      service: args.service,
      middlewares: args.middlewares,
      tls: args.tls,
    });
    return {
      content: [
        {
          type: 'text',
          text: `Router ${args.name} updated successfully`,
        },
      ],
    };
  }

  async deleteRouter(args: { name: string }) {
    await this.traefikService.deleteRouter(args.name);
    return {
      content: [
        {
          type: 'text',
          text: `Router ${args.name} deleted successfully`,
        },
      ],
    };
  }
}

export class MiddlewareTools {
  constructor(private traefikService: ITraefikService) {}

  async listMiddlewares() {
    const middlewares = await this.traefikService.getMiddlewares();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(middlewares, null, 2),
        },
      ],
    };
  }

  async getMiddleware(args: { name: string }) {
    const middleware = await this.traefikService.getMiddleware(args.name);
    if (!middleware) {
      return {
        content: [
          {
            type: 'text',
            text: `Middleware ${args.name} not found`,
          },
        ],
      };
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(middleware, null, 2),
        },
      ],
    };
  }

  async createMiddleware(args: {
    name: string;
    type: string;
    config?: Record<string, any>;
  }) {
    const middleware: Middleware = {
      name: args.name,
      type: args.type,
      config: args.config,
    };
    await this.traefikService.createMiddleware(middleware);
    return {
      content: [
        {
          type: 'text',
          text: `Middleware ${args.name} created successfully`,
        },
      ],
    };
  }

  async deleteMiddleware(args: { name: string }) {
    await this.traefikService.deleteMiddleware(args.name);
    return {
      content: [
        {
          type: 'text',
          text: `Middleware ${args.name} deleted successfully`,
        },
      ],
    };
  }
}

export class ServiceTools {
  constructor(private traefikService: ITraefikService) {}

  async listServices() {
    const services = await this.traefikService.getServices();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(services, null, 2),
        },
      ],
    };
  }
}

export class SystemTools {
  constructor(private traefikService: ITraefikService) {}

  async reloadConfig() {
    await this.traefikService.reloadConfig();
    return {
      content: [
        {
          type: 'text',
          text: 'Configuration reloaded successfully',
        },
      ],
    };
  }

  async getHealth() {
    const health = await this.traefikService.getHealth();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(health, null, 2),
        },
      ],
    };
  }
}