const action_map: Map<string, APIRoute> = new Map();

// Test Chat gpt
action_map.set("post:test", async ({ params, request }) => {
  const { content } = await request.json();  
    const chatCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content}],
      }, {
    
      });

  return new Response(JSON.stringify({error:{}, data: chatCompletion.data}), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
});



const mapper: APIRoute = (ctx: APIContext) => {
  const { action } = ctx.params;
  const found_action = action_map.get(`${ctx.request.method.toLowerCase()}:${action?.toLocaleLowerCase()}`);
  if (found_action) {
    return found_action(ctx);
  }
  return new Response(JSON.stringify({ error_message: `${action} as not found for method "${ctx.request.method}"` }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export default {
  get:(ctx:APIContext) => mapper(ctx),
  post:(ctx:APIContext) => mapper(ctx),
  put:(ctx:APIContext) => mapper(ctx),
  delete:(ctx:APIContext) => mapper(ctx),
}
