export interface Router {
  name: string;
  rule: string;
  service: string;
  middlewares?: string[];
  tls?: {
    certResolver?: string;
  };
}

export interface Service {
  name: string;
  type: string;
  url?: string;
  ports?: number[];
}

export interface Middleware {
  name: string;
  type: string;
  config?: Record<string, any>;
}

export interface ITraefikService {
  getRouters(): Promise<Router[]>;
  getRouter(name: string): Promise<Router | null>;
  createRouter(router: Router): Promise<void>;
  updateRouter(name: string, router: Partial<Router>): Promise<void>;
  deleteRouter(name: string): Promise<void>;

  getMiddlewares(): Promise<Middleware[]>;
  getMiddleware(name: string): Promise<Middleware | null>;
  createMiddleware(middleware: Middleware): Promise<void>;
  updateMiddleware(name: string, middleware: Partial<Middleware>): Promise<void>;
  deleteMiddleware(name: string): Promise<void>;

  getServices(): Promise<Service[]>;
  reloadConfig(): Promise<void>;
  getHealth(): Promise<any>;
}