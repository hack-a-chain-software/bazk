import { Env } from "./types/env";
export { Intermediary } from "./dos/intermediary";

const durableObjecId = "cache";

export default {
  fetch: async (request: any, env: Env) => {
    if (request.method === 'OPTIONS') {
      return new Response(
        null,
        {
          headers: {
            "Access-Control-Allow-Origin": '*',
            "Access-Control-Allow-Methods": 'OPTIONS, POST, GET',
            "Access-Control-Allow-Headers": 'Content-Type',
          }
        }
      );
    }

    const id = env.DURABLE.idFromName(durableObjecId);

    const stub = env.DURABLE.get(id);

    return await stub.fetch(request);
  },
};
