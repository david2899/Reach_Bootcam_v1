import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib();

(async () => {

  const startingBalance = stdlib.parseCurrency(10);

  const accAlice = await stdlib.newTestAccount(startingBalance);  
  const accEve = await stdlib.newTestAccount(startingBalance);

  const fmt = (x) => stdlib.formatCurrency(x, 4);
  const getBalance = async (who) => fmt(await stdlib.balanceOf(who));
  const beforeAlice = await getBalance(accAlice);
  const beforeEve = await getBalance(accEve);

  const ctcAlice = accAlice.contract(backend);
  const ctcEve = accEve.contract(backend, ctcAlice.getInfo());

  const FINGERS = [0, 1, 2, 3, 4, 5];
  const GUESS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];  
  const OUTCOME = ['Eve wins', 'Draw', 'Alice wins'];

  const Player = (Who) => ({
    ...stdlib.hasRandom,
    getFingers: async () => {
  
      const fingers = Math.floor(Math.random() * 6);         
      console.log(`${Who} shoots ${FINGERS[fingers]} fingers`);
        
      return fingers;
    },
    getGuess:  async (fingers) => {
     
      const guess= Math.floor(Math.random() * 6) + FINGERS[fingers];
     
      if ( Math.random() <= 0.01 ) {
        for ( let i = 0; i < 10; i++ ) {
          console.log(`  ${Who} takes their sweet time sending it back...`);
          await stdlib.wait(1);
        }
      }
      console.log(`${Who} guessed total of ${guess}`);   
      return guess;
    },
    seeWinning: (winningNumber) => {    
      console.log(`Actual total fingers thrown: ${winningNumber}`);
      console.log(`***************************`);  
    },

    seeOutcome: (outcome) => {
      console.log(`${Who} saw outcome ${OUTCOME[outcome]}`);
    },
    informTimeout: () => {
      console.log(`${Who} observed a timeout`);
    },
  });

  await Promise.all([
    backend.Eve(ctcEve, {
        ...Player('Eve'),
        acceptWager: (amt) => {      
          console.log(`Eve accepts the wager of ${fmt(amt)}.`);
        },
        ...stdlib.hasConsoleLogger,      
      }),
    backend.Alice(ctcAlice, {
      ...Player('Alice'),
      wager: stdlib.parseCurrency(2),    
      ...stdlib.hasConsoleLogger,
    })
  ]);
  const afterAlice = await getBalance(accAlice);
  const afterEve = await getBalance(accEve);

  console.log(`Alice went from ${beforeAlice} to ${afterAlice}.`);
  console.log(`Eve went from ${beforeEve} to ${afterEve}.`);


})();