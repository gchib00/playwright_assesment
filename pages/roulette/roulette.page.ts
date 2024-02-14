import { expect, type Locator, type Page } from '@playwright/test';
import { Common } from '../common.page';
import type { RouletteState, BettingOption } from './roulette.types';

export class RoulettePage extends Common {
  readonly bettingOptions: Locator;
  readonly wheelCentralText: Locator;
  readonly bettingTimeLimit: number;
  readonly rollingTimeLimit: number;
  readonly announcementTimeLimit: number;

  constructor(page: Page) {
    super(page);
    this.bettingOptions = page.locator('div[class^="bet-buttons"] > div');
    this.wheelCentralText = page.locator('div[class^="text-center"]');
    this.bettingTimeLimit = 15000;
    this.rollingTimeLimit = 6000;
    this.announcementTimeLimit = 3000;
  }

  waitForBettingToStart = async (): Promise<void> => {
    const header = await this.wheelCentralText.locator('div').first();
    const countdown = await this.wheelCentralText.locator('div').last();
    const countdownClassName = await countdown.getAttribute('class') as string;

    await this.page.waitForSelector(`[class="${countdownClassName}"]:has-text("13.")`, {
      state: 'visible',
      timeout: this.bettingTimeLimit + this.rollingTimeLimit + this.announcementTimeLimit
    });
    await expect(header).toContainText('Rolling');
  };

  waitForRollingToStart = async (): Promise<void> => {
    const countdown = await this.wheelCentralText.locator('div').last();
    const className = await countdown.getAttribute('class') as string;

    await this.page.waitForSelector(`[class="${className}"]:has-text("0.00")`, {
      timeout: this.bettingTimeLimit
    });
  };

  waitForWinnerAnnouncement = async (): Promise<void> => {
    // Spots the movement of coins after rolling state is finished
    await this.page.waitForSelector('[class*="previous-rolls-move"]', {
      state: 'attached',
      timeout: this.rollingTimeLimit
    });
    // Coins roll movement animation needs 1 second to resolve
    await this.page.waitForTimeout(1000);
  };

  checkOpacityOfButton = async (btn: Locator): Promise<number> => {
    const getOpacity = async (): Promise<number> => {
      return Number(await btn.evaluate((el: HTMLElement) =>
        window.getComputedStyle(el).getPropertyValue('opacity')
      ));
    }

    while (true) {
      const opacityVal = await getOpacity()

      if (opacityVal === 0.5 || opacityVal === 1) {
        return Number(opacityVal);
      }
    }    
  };

  determineCurrentWinner = async (): Promise<BettingOption> => {
    const latestWinner = await this.page.locator('div[class="previous-rolls-item"] > div').last();
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

    if (activeState === 'betting') {
      await expect(ctBtn).toHaveAttribute('disable', 'false');
      await expect(bonusBtn).toHaveAttribute('disable', 'false');
      await expect(tBtn).toHaveAttribute('disable', 'false');
      expect(ctBtnOpacity).toBe(1);
      expect(bonusBtnOpacity).toBe(1);
      expect(tBtnOpacity).toBe(1);
    } else if (activeState === 'rolling') {
      await expect(ctBtn).toHaveAttribute('disable', 'true');
      await expect(bonusBtn).toHaveAttribute('disable', 'true');
      await expect(tBtn).toHaveAttribute('disable', 'true');

      expect(ctBtnOpacity).toBe(0.5);
      expect(bonusBtnOpacity).toBe(0.5);
      expect(tBtnOpacity).toBe(0.5);
    } else {
      const currentWinner = await this.determineCurrentWinner();
      await expect(ctBtn).toHaveAttribute('disable', 'true');
      await expect(bonusBtn).toHaveAttribute('disable', 'true');
      await expect(tBtn).toHaveAttribute('disable', 'true');

      switch (currentWinner) {
      case ('ct'): {
        expect(ctBtnOpacity).toBe(1);
        expect(bonusBtnOpacity).toBe(0.5);
        expect(tBtnOpacity).toBe(0.5);
        break;
      }
      case ('bonus'): {
        expect(ctBtnOpacity).toBe(0.5);
        expect(bonusBtnOpacity).toBe(1);
        expect(tBtnOpacity).toBe(0.5);
        break;
      }
      case ('t'): {
        expect(ctBtnOpacity).toBe(0.5);
        expect(bonusBtnOpacity).toBe(0.5);
        expect(tBtnOpacity).toBe(1);
      }
      }
    }
  };
}