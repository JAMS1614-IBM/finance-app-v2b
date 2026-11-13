// Manual live check against Yahoo Finance. Not run in CI (the network is flaky).
import { COMPANIES } from '../src/config/companies';
import { createYahooClient } from '../server/providers/yahooClient';
import { createYahooMarketDataService } from '../server/providers/yahooProvider';

const service = createYahooMarketDataService(createYahooClient());
const symbols = COMPANIES.map((c) => c.symbol);

console.log('quotes:', await service.getQuotes(symbols));
for (const window of ['today', 'week', 'quarter'] as const) {
  const history = await service.getHistory(symbols, window);
  console.log(window, Object.fromEntries(Object.entries(history).map(([s, p]) => [s, p.length])));
}
