import { type Page } from '@playwright/test';

export class Common {
  constructor(
    readonly page: Page,
    readonly isMobile?: boolean,
  ) { }

  goToPath = async (path: string): Promise<void> => {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  };
}