import { Browser, BrowserContext, Page, chromium } from "playwright";

type Session = {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  updatedAt: number;
};

export default class PlaywrightSessionManager {
  private sessions = new Map<string, Session>();
  private cleanupTimer: NodeJS.Timeout;
  private cleanupRunning = false;

  constructor(
    private readonly sessionTtlMs: number = Number(process.env.PLAYWRIGHT_SESSION_TTL_MS) || 30 * 60 * 1000,
    private readonly cleanupIntervalMs: number =
      Number(process.env.PLAYWRIGHT_SESSION_CLEANUP_INTERVAL_MS) || 60 * 1000
  ) {
    this.cleanupTimer = setInterval(() => {
      void this.cleanupExpiredSessions();
    }, this.cleanupIntervalMs);
    this.cleanupTimer.unref?.();
  }

  async getOrCreateSession(clientId: string): Promise<Session> {
    const existing = this.sessions.get(clientId);
    if (existing) {
      existing.updatedAt = Date.now();
      return existing;
    }

    const browser = await chromium.launch({
      headless: true,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
      ],
    });

    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      locale: "pt-BR",
      timezoneId: "America/Belem",
      viewport: { width: 1366, height: 768 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      extraHTTPHeaders: {
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });
    const page = await context.newPage();
    await page.addInitScript(
      "Object.defineProperty(navigator, 'webdriver', { get: () => undefined });"
    );

    const session: Session = {
      browser,
      context,
      page,
      updatedAt: Date.now(),
    };

    this.sessions.set(clientId, session);
    return session;
  }

  async closeSession(clientId: string): Promise<boolean> {
    const session = this.sessions.get(clientId);
    if (!session) {
      return false;
    }

    await session.page.close({ runBeforeUnload: false }).catch(() => undefined);
    await session.context.close().catch(() => undefined);
    await session.browser.close().catch(() => undefined);
    this.sessions.delete(clientId);
    return true;
  }

  private async cleanupExpiredSessions(): Promise<void> {
    if (this.cleanupRunning) {
      return;
    }
    this.cleanupRunning = true;
    try {
      const now = Date.now();
      const expiredClientIds = Array.from(this.sessions.entries())
        .filter(([, session]) => now - session.updatedAt >= this.sessionTtlMs)
        .map(([clientId]) => clientId);

      if (expiredClientIds.length === 0) {
        return;
      }

      await Promise.all(expiredClientIds.map((clientId) => this.closeSession(clientId)));
    } finally {
      this.cleanupRunning = false;
    }
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  async closeAll(): Promise<void> {
    const ids = Array.from(this.sessions.keys());
    await Promise.all(ids.map((id) => this.closeSession(id)));
  }

  async dispose(): Promise<void> {
    clearInterval(this.cleanupTimer);
    await this.closeAll();
  }
}
