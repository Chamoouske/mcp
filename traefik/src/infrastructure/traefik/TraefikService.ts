import axios, { AxiosInstance } from 'axios';
import { ITraefikService, Router, Middleware, Service } from '../../domain/interfaces/ITraefikService.js';

export class TraefikService implements ITraefikService {
  private client: AxiosInstance;
  private provider: string;

  constructor(baseUrl: string = 'http://traefik:8080', provider: string = 'file') {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
    });
    this.provider = provider;
  }

  async getRouters(): Promise<Router[]> {
    try {
      const response = await this.client.get(`/api/http/routers`);
      return Object.entries(response.data).map(([name, data]: [string, any]) => ({
        name,
        rule: data.rule,
        service: data.service,
        middlewares: data.middlewares,
        tls: data.tls,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get routers: ${error.message}`);
    }
  }

  async getRouter(name: string): Promise<Router | null> {
    try {
      const response = await this.client.get(`/api/http/routers/${name}`);
      const data = response.data;
      return {
        name,
        rule: data.rule,
        service: data.service,
        middlewares: data.middlewares,
        tls: data.tls,
      };
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw new Error(`Failed to get router: ${error.message}`);
    }
  }

  async createRouter(router: Router): Promise<void> {
    try {
      await this.client.put(`/api/http/routers/${router.name}`, {
        rule: router.rule,
        service: router.service,
        middlewares: router.middlewares,
        tls: router.tls,
      });
    } catch (error: any) {
      throw new Error(`Failed to create router: ${error.message}`);
    }
  }

  async updateRouter(name: string, router: Partial<Router>): Promise<void> {
    try {
      const current = await this.getRouter(name);
      if (!current) throw new Error(`Router ${name} not found`);
      
      await this.client.put(`/api/http/routers/${name}`, {
        rule: router.rule ?? current.rule,
        service: router.service ?? current.service,
        middlewares: router.middlewares ?? current.middlewares,
        tls: router.tls ?? current.tls,
      });
    } catch (error: any) {
      throw new Error(`Failed to update router: ${error.message}`);
    }
  }

  async deleteRouter(name: string): Promise<void> {
    try {
      await this.client.delete(`/api/http/routers/${name}`);
    } catch (error: any) {
      throw new Error(`Failed to delete router: ${error.message}`);
    }
  }

  async getMiddlewares(): Promise<Middleware[]> {
    try {
      const response = await this.client.get(`/api/http/middlewares`);
      return Object.entries(response.data).map(([name, data]: [string, any]) => ({
        name,
        type: data.type,
        config: data.config,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get middlewares: ${error.message}`);
    }
  }

  async getMiddleware(name: string): Promise<Middleware | null> {
    try {
      const response = await this.client.get(`/api/http/middlewares/${name}`);
      const data = response.data;
      return {
        name,
        type: data.type,
        config: data.config,
      };
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw new Error(`Failed to get middleware: ${error.message}`);
    }
  }

  async createMiddleware(middleware: Middleware): Promise<void> {
    try {
      await this.client.put(`/api/http/middlewares/${middleware.name}`, {
        type: middleware.type,
        ...middleware.config,
      });
    } catch (error: any) {
      throw new Error(`Failed to create middleware: ${error.message}`);
    }
  }

  async updateMiddleware(name: string, middleware: Partial<Middleware>): Promise<void> {
    try {
      const current = await this.getMiddleware(name);
      if (!current) throw new Error(`Middleware ${name} not found`);
      
      await this.client.put(`/api/http/middlewares/${name}`, {
        type: middleware.type ?? current.type,
        ...(middleware.config ?? current.config),
      });
    } catch (error: any) {
      throw new Error(`Failed to update middleware: ${error.message}`);
    }
  }

  async deleteMiddleware(name: string): Promise<void> {
    try {
      await this.client.delete(`/api/http/middlewares/${name}`);
    } catch (error: any) {
      throw new Error(`Failed to delete middleware: ${error.message}`);
    }
  }

  async getServices(): Promise<Service[]> {
    try {
      const response = await this.client.get(`/api/http/services`);
      return Object.entries(response.data).map(([name, data]: [string, any]) => ({
        name,
        type: data.type,
        url: data.url,
        ports: data.ports,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get services: ${error.message}`);
    }
  }

  async reloadConfig(): Promise<void> {
    try {
      await this.client.post('/api/restart');
    } catch (error: any) {
      throw new Error(`Failed to reload config: ${error.message}`);
    }
  }

  async getHealth(): Promise<any> {
    try {
      const response = await this.client.get('/api/overview');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get health: ${error.message}`);
    }
  }
}