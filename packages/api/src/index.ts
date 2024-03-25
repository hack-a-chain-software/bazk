import { Env } from "./types/env";
export { Intermediary } from "./dos/intermediary";

const durableObjecId = "cache";

export default {
  fetch: async (request: any, env: Env) => {
    const id = env.DURABLE.idFromName(durableObjecId);

    const stub = env.DURABLE.get(id);

    try {
      const commandOuput = await stub.fetch(request);

      console.log(commandOuput, 'commandOuput')

      return commandOuput
    } catch (err) {
      console.warn(
        "execution failed during durable object request, error: ",
        err
      )

      return new Response(
        "execution failed during durable object request, error: ",
        {
          status: 405
        }
      )
    }
  },
};
