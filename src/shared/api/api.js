export const getTickets = (tickerNames) => {
  const tsyms = tickerNames.join(",");

  return fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tsyms}`
  ).then((r) => r.json());
};

let nextRequestTimeoutId;

export const subscribeToTickers = (tickerNames, cb) => {
  clearInterval(nextRequestTimeoutId);
  if (!tickerNames.length) return;

  getTickets(tickerNames)
    .then(cb)
    .finally(() => {
      nextRequestTimeoutId = setTimeout(
        () => subscribeToTickers(tickerNames, cb),
        1000
      );
    });
};
