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

const ApiMessages = {
  INVALID_SUB: "INVALID_SUB",
  UNSUBSCRIBE_COMPLETE: "UNSUBSCRIBECOMPLETE",
  SUBSCRIBE_COMPLETE: "SUBSCRIBECOMPLETE",
};

const CROSS_KEY = "BTC";
const DEFAULT_KEY = "USD";

const tickers = new Map();
const socket = new WebSocket(`${API_WS_URL}?api_key=${API_KEY}`);

const parseApiData = (data) => {
  const { MESSAGE, PRICE, SUB, FROMSYMBOL, PARAMETER } = JSON.parse(data);

  const parseCurrency = (string) => string.split("~")[2];

  return {
    message: MESSAGE,
    price: PRICE,
    currency: FROMSYMBOL || parseCurrency(PARAMETER || SUB),
  };
};

socket.onmessage = ({ data }) => {
  const { message, price, currency } = parseApiData(data);

  // if we successfully delete ticker
  if (message === ApiMessages.UNSUBSCRIBE_COMPLETE) {
    tickers.delete(currency);
    return;
  }

  // if invalid, try to resubscribe
  if (message === ApiMessages.INVALID_SUB) {
    const ticker = tickers.get(currency);

    // if we can't resubscribe
    if (ticker.quote === CROSS_KEY) {
      ticker.onError();
      tickers.delete(currency);
      return;
    }

    // if we don't have cross currency subscribe
    if (!tickers.has(CROSS_KEY)) {
      subscribeToTickerOnWs(CROSS_KEY, DEFAULT_KEY);
    }

    // change invalid ticker quote and subscribe
    tickers.set(currency, { ...ticker, quote: CROSS_KEY });
    subscribeToTickerOnWs(currency, CROSS_KEY);
  }

  if (!price || !currency) return;

  // update tickers dependent on currency
  if (currency === CROSS_KEY) {
    tickers.forEach((ticker) => {
      if (ticker.quote !== currency) return;
      ticker.onSuccess(price * ticker.price);
    });
  }

  // update ticker currency
  const ticker = tickers.get(currency);
  tickers.set(currency, { ...ticker, price });

  // correct init value
  if (ticker.quote === CROSS_KEY) {
    const crossTicker = tickers.get(CROSS_KEY);
    if (!crossTicker.price) return;
    ticker.onSuccess(price * crossTicker.price);
    return;
  }

  // call view cb
  ticker.onSuccess(price);
};

const sendToWebSocket = (message) => {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.onopen = () => socket.send(stringifiedMessage);
};

const subscribeToTickerOnWs = (base, quote = DEFAULT_KEY) => {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${base}~${quote}`],
  });
};

const unsubscribeFromTickerOnWs = (base, quote = DEFAULT_KEY) => {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${base}~${quote}`],
  });
};

export const subscribeToTicker = (key, onSuccess, onError = _.noop) => {
  if (tickers.has(key)) return;

  const ticker = {
    price: null,
    quote: DEFAULT_KEY,
    onSuccess,
    onError,
  };

  tickers.set(key, ticker);
  subscribeToTickerOnWs(key, ticker.quote);
};

export const unsubscribeFromTicker = (key) => {
  if (!tickers.has(key) || key === CROSS_KEY) return;
  const { quote } = tickers.get(key);
  unsubscribeFromTickerOnWs(key, quote);
};
