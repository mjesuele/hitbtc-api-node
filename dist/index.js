'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _websocketClient = require('./websocketClient');

var _websocketClient2 = _interopRequireDefault(_websocketClient);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _get = require('lodash/fp/get');

var _get2 = _interopRequireDefault(_get);

var _keyBy = require('lodash/fp/keyBy');

var _keyBy2 = _interopRequireDefault(_keyBy);

var _map = require('lodash/fp/map');

var _map2 = _interopRequireDefault(_map);

var _mapValues = require('lodash/fp/mapValues');

var _mapValues2 = _interopRequireDefault(_mapValues);

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _qs = require('qs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Convert order book entries to a more convenient format
const labelOrderBookEntries = (0, _mapValues2.default)((0, _map2.default)(([price, volume]) => ({ price, volume })));

// Ditto for the balance data
const formatBalanceData = (0, _mapValues2.default)((0, _keyBy2.default)((0, _get2.default)(`currency_code`)));

const uri = (path, params) => `${path}?${(0, _qs.stringify)(params)}`;

class HitBTC {

  constructor({ key, secret, isDemo = false } = { isDemo: false }) {
    this.requestPublic = (endpoint, params = {}) => _axios2.default.get(`${this.url}/public${endpoint}`, { params }).then((0, _get2.default)(`data`)).catch((0, _get2.default)(`response.data`));

    this.getTimestamp = () => this.requestPublic(`/time`);

    this.getSymbols = () => this.requestPublic(`/symbols`);

    this.getTicker = symbol => this.requestPublic(`/${symbol}/ticker`);

    this.getAllTickers = () => this.requestPublic(`/ticker`);

    this.getOrderBook = symbol => this.requestPublic(`/${symbol}/orderbook`, {
      format_amount: `number`,
      format_price: `number`
    }).then(labelOrderBookEntries);

    this.getTrades = (symbol, params = {}) => this.requestPublic(`/${symbol}/trades`, _extends({
      format_amount: `number`,
      format_item: `object`,
      format_price: `number`
    }, params));

    this.getRecentTrades = (symbol, params = {}) => this.requestPublic(`/${symbol}/trades/recent`, _extends({
      max_results: 100,
      format_item: `object`
    }, params));

    this.requestTrading = (endpoint, method, params = {}) => {
      if (!this.key || !this.secret) {
        throw new Error(`API key and secret key required to use authenticated methods`);
      }

      const path = `/api/1/trading${endpoint}`;

      // All requests include these
      const authParams = {
        apikey: this.key,
        nonce: Date.now()
      };

      // If this is a GET request, all params go in the URL.
      // Otherwise, only the auth-related ones do.
      const requestPath = uri(path, method === `get` ? _extends({}, authParams, params) : authParams);

      const requestUrl = `${this.baseUrl}${requestPath}`;

      // Compute the message to encrypt for the signature.
      const message = method === `get` ? requestPath : `${requestPath}${(0, _qs.stringify)(params)}`;

      const signature = _crypto2.default.createHmac(`sha512`, this.secret).update(message).digest(`hex`);

      const config = {
        headers: {
          'X-Signature': signature
        }
      };

      // Figure out the arguments to pass to axios.
      const args = method === `get` ? [config] : [(0, _qs.stringify)(params), config];

      return _axios2.default[method](requestUrl, ...args).then((0, _get2.default)(`data`)).catch((0, _get2.default)(`response.data`));
    };

    this.getMyBalance = () => this.requestTrading(`/balance`, `get`, {}).then(formatBalanceData);

    this.getMyActiveOrders = (params = {}) => this.requestTrading(`/orders/active`, `get`, params);

    this.placeOrder = (params = {}) => this.requestTrading(`/new_order`, `post`, _extends({
      clientOrderId: (0, _shortid2.default)()
    }, params));

    this.cancelOrder = (params = {}) => this.requestTrading(`/cancel_order`, `post`, _extends({
      cancelRequestClientOrderId: (0, _shortid2.default)()
    }, params));

    this.cancelAllOrders = (params = {}) => this.requestTrading(`/cancel_orders`, `post`, params);

    this.getMyRecentOrders = (params = {}) => this.requestTrading(`/orders/recent`, `get`, _extends({
      max_results: 100,
      sort: `desc`
    }, params));

    this.getMyOrder = (params = {}) => this.requestTrading(`/order`, `get`, params);

    this.getMyTradesByOrder = (params = {}) => this.requestTrading(`/trades/by/order`, `get`, params);

    this.getAllMyTrades = (params = {}) => this.requestTrading(`/trades`, `get`, _extends({
      by: `trade_id`,
      max_results: 100,
      start_index: 0,
      sort: `desc`
    }, params));

    this.key = key;
    this.secret = secret;
    const subdomain = isDemo ? `demo-api` : `api`;
    this.baseUrl = `http://${subdomain}.hitbtc.com`;
    this.url = `${this.baseUrl}/api/1`;
  }

}
exports.default = HitBTC;
HitBTC.WebsocketClient = _websocketClient2.default;