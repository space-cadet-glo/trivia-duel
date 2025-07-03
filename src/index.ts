export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Extract game code from the path, e.g. /duel/ABCD/create
    const match = path.match(/^\/duel\/([A-Z]{4})(\/\w+)?$/);
    if (!match) {
      return new Response("Not found", { status: 404 });
    }

    const gameCode = match[1];
    const subpath = match[2] || "";

    // Create a stub to the corresponding Durable Object
    const id = env.DUEL_GAME.idFromName(gameCode);
    const stub = env.DUEL_GAME.get(id);

    // Forward the request to the Durable Object
    const durableRequest = new Request(`https://duel${subpath}`, request);
    return stub.fetch(durableRequest);
  }
};

import { DuelGame } from './duel/DuelGame';

export { DuelGame };