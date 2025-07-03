export const onRequestPost: PagesFunction<{
  DUEL_GAME: DurableObjectNamespace
}> = async ({ env }) => {
  const id = env.DUEL_GAME.newUniqueId()
  const stub = env.DUEL_GAME.get(id)

  // Create the game with some initial state
  const res = await stub.fetch("https://internal/initialize")

  const code = (await res.json()).code

  return new Response(JSON.stringify({ code }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  })
}