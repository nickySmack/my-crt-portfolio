import { initBotId } from 'botid/client/core';

// Attaches BotID challenge headers to these requests; the routes call checkBotId().
initBotId({
  protect: [{ path: '/api/ask', method: 'POST' }],
});
