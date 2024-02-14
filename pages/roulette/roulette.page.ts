import { expect, type Locator, type Page } from '@playwright/test';
import { Common } from '../common.page';
import type { RouletteState, BettingOption } from './roulette.types';

export class RoulettePage extends Common {
  readonly bettingOptions: Locator;
  readonly wheelCentralText: Locator;
  readonly timeoutForFrontendMount: number;
  readonly requestTimeout: number;

  constructor(page: Page) {
    super(page);
    this.bettingOptions = page.locator('div[class^="bet-buttons"] > div');
    this.wheelCentralText = page.locator('div[class^="text-center"]');
    this.requestTimeout = 8000;
    this.timeoutForFrontendMount = 5000;
  }

  waitForBettingToStart = async (): Promise<void> => {
    const header = await this.wheelCentralText.locator('div').first();
    const countdown = await this.wheelCentralText.locator('div').last();
    const countdownClassName = await countdown.getAttribute('class') as string;

    await this.page.waitForSelector(`[class="${countdownClassName}"]:has-text("14.")`, {
      state: 'visible',
      timeout: 15000 + 6000 + 3000
    });
    await expect(header).toContainText('Rolling');
  };

  waitForRollingToStart = async (): Promise<void> => {
    const countdown = await this.wheelCentralText.locator('div').last();
    const className = await countdown.getAttribute('class') as string;

    await this.page.waitForSelector(`[class="${className}"]:has-text("0.00")`, {
      timeout: 15000
    });
  };

  waitForWinnerAnnouncement = async (): Promise<void> => {
    const rollingDuration = 6000;
    await this.page.waitForTimeout(rollingDuration + 2000);
  };

  checkOpacityOfButton = async (btn: Locator): Promise<number> => {
    const opacity = await btn.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).getPropertyValue('opacity')
    );
    return Number(opacity);
  };

  determineCurrentWinner = async (): Promise<BettingOption> => {
    const latestWinner = await this.page.locator('div[class="previous-rolls-item"] > div').nth(10);
    const className = await latestWinner.getAttribute('class') as string;
    const optionName = className.split(' ')[0].split('-')[1];

    return optionName as BettingOption;
  };

  assertBettingButtonsVisibility = async (activeState: RouletteState): Promise<void> => {
    const [ctOption, bonusOption, tOption] = await this.bettingOptions.all();
    const ctBtn = await ctOption.locator('button');
    const bonusBtn = await bonusOption.locator('button');
    const tBtn = await tOption.locator('button');
    const ctBtnOpacity = await this.checkOpacityOfButton(ctBtn);
    const bonusBtnOpacity = await this.checkOpacityOfButton(bonusBtn);
    const tBtnOpacity = await this.checkOpacityOfButton(tBtn);
    const diffTolerance = 0.2; // Allow opacity to be 2 decimal places off (e.g. allow 0.62 to pass as 0.5) 

    if (activeState === 'betting') {
      await expect(ctBtn).toHaveAttribute('disable', 'false');
      await expect(bonusBtn).toHaveAttribute('disable', 'false');
      await expect(tBtn).toHaveAttribute('disable', 'false');

      expect(ctBtnOpacity).toBeCloseTo(1, diffTolerance);
      expect(bonusBtnOpacity).toBeCloseTo(1, diffTolerance);
      expect(tBtnOpacity).toBeCloseTo(1, diffTolerance);
    } else if (activeState === 'rolling') {
      await expect(ctBtn).toHaveAttribute('disable', 'true');
      await expect(bonusBtn).toHaveAttribute('disable', 'true');
      await expect(tBtn).toHaveAttribute('disable', 'true');

      expect(ctBtnOpacity).toBeCloseTo(0.5, diffTolerance);
      expect(bonusBtnOpacity).toBeCloseTo(0.5, diffTolerance);
      expect(tBtnOpacity).toBeCloseTo(0.5, diffTolerance);
    } else {
      const currentWinner = await this.determineCurrentWinner();
      await expect(ctBtn).toHaveAttribute('disable', 'true');
      await expect(bonusBtn).toHaveAttribute('disable', 'true');
      await expect(tBtn).toHaveAttribute('disable', 'true');

      switch (currentWinner) {
      case ('ct'): {
        expect(ctBtnOpacity).toBeCloseTo(1, diffTolerance);
        expect(bonusBtnOpacity).toBeCloseTo(0.5, diffTolerance);
        expect(tBtnOpacity).toBeCloseTo(0.5, diffTolerance);
        break;
      }
      case ('bonus'): {
        expect(ctBtnOpacity).toBeCloseTo(0.5, diffTolerance);
        expect(bonusBtnOpacity).toBeCloseTo(1, diffTolerance);
        expect(tBtnOpacity).toBeCloseTo(0.5, diffTolerance);
        break;
      }
      case ('t'): {
        expect(ctBtnOpacity).toBeCloseTo(0.5, diffTolerance);
        expect(bonusBtnOpacity).toBeCloseTo(0.5, diffTolerance);
        expect(tBtnOpacity).toBeCloseTo(1, diffTolerance);
        break;
      }
      }
    }
  };
}