export const getTickets = () => {
  return fetch(
    "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,JPY,EUR"
  ).then((r) => r.json());
};
