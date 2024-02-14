import { type Page, test } from '@playwright/test';
import { RoulettePage } from '../pages/roulette/roulette.page';


test('Roulette full cycle test', async ({ page }: Page) => {
  const roulettePage = new RoulettePage(page);

  await roulettePage.goToPath('/roulette');
  await roulettePage.waitForBettingToStart();
  await roulettePage.assertBettingButtonsVisibility('betting');
  await roulettePage.waitForRollingToStart();
  await roulettePage.assertBettingButtonsVisibility('rolling');
  await roulettePage.waitForWinnerAnnouncement();
  await roulettePage.assertBettingButtonsVisibility('announcing');
  await roulettePage.waitForBettingToStart();
  await roulettePage.assertBettingButtonsVisibility('betting');
});
