export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url)
  const category = url.searchParams.get("category")
  const difficulty = url.searchParams.get("difficulty") || "medium"

  const apiUrl = new URL("https://opentdb.com/api.php")
  apiUrl.searchParams.set("amount", "10")
  apiUrl.searchParams.set("difficulty", difficulty)
  if (category) apiUrl.searchParams.set("category", category)

  try {
    const response = await fetch(apiUrl.toString())
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err: any) {
    return new Response("Failed to fetch trivia questions", {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  }
}