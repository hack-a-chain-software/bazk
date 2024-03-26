
import type { Env } from "../types/env";
import type { FetchResponseInterface } from "../types/intermediary";

export const sendRequest = async (args: any, env: Env): Promise<FetchResponseInterface> => {
  const response = await fetch(env.POD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });

  return await response.json();
};
