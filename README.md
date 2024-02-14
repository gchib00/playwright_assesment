Installation:
1) npm install
2) Ensure you have Chromium installed for Playwright (npx playwright install --with-deps chromium)
3) Add a ".env" file (check .env_example)




# Roulette cycle test case

<img src="https://imgur.com/K2zeyVG.jpg"/>

## Test Scenario:
Ensure the roulette cycle works as expected - should iterate through 3 states in a cycle (betting state -> rolling state -> announcing state -> betting state).

## Dependant components: 
- Roulette wheel
- 3 buttons for placing bets
- “Previous rolls” component

## Test steps:

1) Wait until the betting stage begins.
2) Betting state: (Allows the user to place bets)
The wheel component displays a timer with a 15 second countdown
- Betting buttons can be clicked (i.e. multiple bets can be placed simultaneously)
- Expires once the countdown reaches 0
- Succeeded by the rolling state
3) Rolling state: (Prepares the user for the announcing state)
- The timer from the wheel component is hidden
- Betting buttons are disabled
- Expires after 6 seconds
- Succeeded by the announcing state
4) Announcing state: (Announces the winning outcome to the user)
- The timer from the wheel component remains hidden
- Betting buttons remain disabled
- The wheel component displays the winning outcome
- The betting button that represents the winning outcome appears to be enabled (But only visually. In practice, it is disabled/unclickable)
- “Previous rolls” component is updated accordingly
- Expires after 3 seconds
- Succeeded by the betting state
5) Repeat step 1 (this is needed to ensure that the cycle can be completed successfully).

