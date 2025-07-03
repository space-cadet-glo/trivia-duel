export interface Env {
  DUEL_GAME: DurableObjectNamespace;
}

export class DuelGame {
  state: DurableObjectState;
  env: Env;
  gameCode: string;
  gameState: any = {};

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.gameCode = state.id.toString(); // unique identifier
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'POST' && path.endsWith('/create')) {
      const body = await request.json();
      const { category, difficulty } = body;

      const triviaRes = await fetch(
        `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}`
      );
      const data = await triviaRes.json();

      this.gameState = {
        code: this.gameCode,
        players: [true, null],
        questions: data.results,
        started: false,
      };

      await this.state.storage.put('state', this.gameState);

      return new Response(JSON.stringify({ ok: true }), {
        headers: corsHeaders,
      });
    }

    if (request.method === 'POST' && path.endsWith('/join')) {
      this.gameState = await this.state.storage.get('state') || {};
      this.gameState.players[1] = true;
      this.gameState.started = true;
      await this.state.storage.put('state', this.gameState);

      return new Response(JSON.stringify({ ok: true }), {
        headers: corsHeaders,
      });
    }

    if (request.method === 'GET' && path.endsWith('/questions')) {
      this.gameState = await this.state.storage.get('state') || {};
      return new Response(JSON.stringify(this.gameState.questions || []), {
        headers: corsHeaders,
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};