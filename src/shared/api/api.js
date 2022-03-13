import { API_KEY, API_WS_URL } from "@/shared/config";
import * as _ from "lodash";

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

// WEB SOCKETS
const AGGREGATE_INDEX = "5";
const UNDEFIEND_CODE = "500";
const tickersHandlers = new Map();
const socket = new WebSocket(`${API_WS_URL}?api_key=${API_KEY}`);

socket.onmessage = ({ data }) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    PARAMETER: parameter,
  } = JSON.parse(data);

  console.log("RESPONSE", JSON.parse(data));

  if (type === UNDEFIEND_CODE) {
    const currency = parameter.split("~")[2];
    tickersHandlers.get(currency).onError();
    tickersHandlers.delete(currency);
    return;
  }

  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  tickersHandlers.get(currency).onSuccess(newPrice);
};

const sendToWebSocket = (message) => {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.onopen = () => socket.send(stringifiedMessage);
};

const subscribeToTickerOnWs = (base, quote = "USD") => {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${base}~${quote}`],
  });
};

const unsubscribeFromTickerOnWs = (base, quote = "USD") => {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${base}~${quote}`],
  });
};

export const subscribeToTicker = (ticker, onSuccess, onError = _.noop) => {
  tickersHandlers.set(ticker, { onSuccess, onError });
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  if (!tickersHandlers.has(ticker)) return;
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};
