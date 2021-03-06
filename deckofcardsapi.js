const fetch = require("node-fetch");

let deckid = "x42bv93qdk7h";
let remainingCards;

exports.newDeck = () => {
  return new Promise((resolve, reject) => {
    fetch(
      "https://deckofcardsapi.com/api/deck/new/shuffle/?jokers_enabled=true"
    )
      .then(res => res.json())
      .then(json => {
        const { success, deck_id, remaining } = json;
        if (!success) {
          reject("Error generating deck");
        } else {
          console.log(`Deck with id ${deck_id} generated`);
          deckid = deck_id;
          remainingCards = remaining;
          resolve("Success!");
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

exports.shuffleDeck = () => {
  return new Promise((resolve, reject) => {
    if (deckid === undefined) {
      reject("Need deck first!");
    }
    fetch(`https://deckofcardsapi.com/api/deck/${deckid}/shuffle/`)
      .then(res => res.json())
      .then(json => {
        const { success, deck_id, remaining } = json;
        if (!success) {
          reject("Error shuffling deck :(");
        } else {
          deckid = deck_id;
          remainingCards = remaining;
          resolve("Success!");
        }
      })
      .catch(err => reject(err));
  });
};

exports.drawCards = (count = 1) => {
  return new Promise((resolve, reject) => {
    if (deckid === undefined) {
      reject("Need deck first!");
    }
    if (remainingCards === 0) {
      reject("NEED TO SHUFFLE FIRST");
    }
    fetch(`https://deckofcardsapi.com/api/deck/${deckid}/draw/?count=${count}`)
      .then(res => res.json())
      .then(json => {
        const { success, cards } = json;
        if (!success) {
          reject("Error drawing card");
        } else {
          resolve(cards);
        }
      })
      .catch(err => reject(err));
  });
};
