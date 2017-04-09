# hitbtc-api

HitBTC API wrapper for Node.js

## Installation

```
yarn add hitbtc-api
```

## Usage

Clients for both the [REST API](https://hitbtc.com/api#restful) and
[streaming WebSocket API](https://hitbtc.com/api#streaming) are included. Private
methods as indicated in the docs require authentication with an API key and
secret key.

### Example usage:

```javascript
import HitBTC from 'hitbtc-api';

const restClient = new HitBTC({ key, secret, isDemo: false });
const websocketClient =
  new HitBTC.WebsocketClient({ key, secret, isDemo: false });

restClient.getOrderBook('BTCUSD')
  .then(console.log)
  .catch(console.error);

websocketClient.addMarketMessageListener(data => {
  if (data.MarketDataSnapshotFullRefresh) console.log(data);
});

// The methods are bound properly, so feel free to destructure them:
const { getMyBalance } = restClient;
getMyBalance()
  .then(({ balance }) => console.log(
    `My USD balance is ${balance.USD.cash}!`
  ))
```

## API

### REST
All methods return promises.
* getTimestamp()
* getSymbols()
* getTicker(symbol)
* getAllTickers()
* getOrderBook(symbol)
* getTrades(symbol, params = {})
* getRecentTrades(symbol, params = {})
* getMyBalance()
* getMyActiveOrders(params = {})
* placeOrder(params = {})
* cancelOrder(params = {})
* cancelAllOrders(params = {})
* getMyRecentOrders(params = {})
* getMyOrder(params = {})
* getMyTradesByOrder(params = {})
* getAllMyTrades(params = {})

### WebSocket
* addMarketMessageListener(listener)
* addTradingMessageListener(listener)
* removeMarketMessageListener(listener)
* removeTradingMessageListener(listener)
* addMarketListener(event, listener)
* addTradingListener(event, listener)
* removeMarketListener(event, listener)
* removeTradingListener(event, listener)

## To Do
* Tests
* Improved documentation
* More robust error handling

Feedback and pull requests welcome!
