'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _get = require('lodash/fp/get');

var _get2 = _interopRequireDefault(_get);

var _pipe = require('lodash/fp/pipe');

var _pipe2 = _interopRequireDefault(_pipe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const withData = listener => (0, _pipe2.default)((0, _get2.default)(`data`), dataString => JSON.parse(dataString), listener);

class HitBTCWebsocketClient {
  constructor({ key, secret, isDemo = false }) {
    this.createRequestData = payload => {
      const message = {
        nonce: Date.now(),
        payload
      };

      const signature = _crypto2.default.createHmac(`sha512`, this.secret).update(JSON.stringify(message)).digest(`base64`);

      message.payload;

      return JSON.stringify({
        apikey: this.key,
        signature,
        message
      });
    };

    this.addMarketMessageListener = listener => this.marketSocket.addEventListener(`message`, withData(listener));

    this.addTradingMessageListener = listener => this.tradingSocket.addEventListener(`message`, withData(listener));

    this.removeMarketMessageListener = listener => this.marketSocket.removeEventListener(`message`, withData(listener));

    this.removeTradingMessageListener = listener => this.tradingSocket.removeEventListener(`message`, withData(listener));

    this.addMarketListener = (event, listener) => this.marketSocket.addEventListener(event, listener);

    this.addTradingListener = (event, listener) => this.tradingSocket.addEventListener(event, listener);

    this.removeMarketListener = (event, listener) => this.marketSocket.removeEventListener(event, listener);

    this.removeTradingListener = (event, listener) => this.tradingSocket.removeEventListener(event, listener);

    this.key = key;
    this.secret = secret;
    this.baseUrl = `${isDemo ? `demo-api` : `api`}.hitbtc.com`;
    this.marketUrl = `ws://${this.baseUrl}:80`;
    this.tradingUrl = `wss://${this.baseUrl}:8080`;
    this.hasCredentials = key && secret;

    this.marketSocket = new _ws2.default(this.marketUrl);

    if (this.hasCredentials) {
      this.tradingSocket = new _ws2.default(this.tradingUrl);
      this.tradingSocket.addEventListener(`open`, () => this.tradingSocket.send(this.createRequestData({ Login: {} })));
    }
  }

}
exports.default = HitBTCWebsocketClient;