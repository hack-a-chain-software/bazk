import { Env } from "../types/env";
import { BusyState } from "../types/intermediary";
import { sendRequest } from "../services/request";

/**
 * The Durable Object
 */
export class Intermediary {
  env: Env;
  durable: DurableObjectState;

  /** constructor
   * The constructor of durable object
   * @param state The durable feeder state
   * @param env The env object
   * @returns void
   */
  constructor(durable: DurableObjectState, env: Env) {
    this.env = env;
    this.durable = durable;
  }

  /** getCurrentState
   * This function returns the current state.
   * @returns The current state
   */
  async getCurrentState (): Promise<BusyState> {
    return await this.durable.storage.get<BusyState>('busy') || false;
  }

  /** updateCurrentCounter
   * This function update the current state.
   * @param counter The new state value
   * @returns void
   */
  async updateCurrentState (flag: BusyState): Promise<void> {
    return await this.durable.storage.put('busy', flag);
  }

  /** fetch
   * This function check if pod was working and execute the command
   * @param request The request object
   * @returns The response with command output
   */
  async fetch(request: any) {
    const args = await request.json()

    const currentState = await this.getCurrentState();

    console.log("[DOS] Current state ", currentState)

    if (currentState) {
      return new Response(JSON.stringify({
        sucess: false,
        message: "Pod is already executing a command, please try again later."
      }), {
        headers: {
          "Access-Control-Allow-Origin": '*',
          "Access-Control-Allow-Methods": 'OPTIONS, POST, GET',
          "Access-Control-Allow-Headers": 'Content-Type',
        }
      });
    }

    await this.updateCurrentState(true);

    try {
      console.log("[DOS] Try to execute command for params ", args)

      const res = await sendRequest(args, this.env);

      await this.updateCurrentState(false);

      await new Promise(resolve => setTimeout(resolve, 4000));

      console.log("[DOS] Command output ", res)

      return new Response(JSON.stringify(res), {
        headers: {
          "Access-Control-Allow-Origin": '*',
          "Access-Control-Allow-Methods": 'OPTIONS, POST, GET',
          "Access-Control-Allow-Headers": 'Content-Type',
        }
      });
    } catch (e: any) {
      await this.updateCurrentState(false);

      console.log("[DOS] Command ERROR ", e)

      return new Response(JSON.stringify({
        sucess: false,
        message: e.message
      }), {
        headers: {
          "Access-Control-Allow-Origin": '*',
          "Access-Control-Allow-Methods": 'OPTIONS, POST, GET',
          "Access-Control-Allow-Headers": 'Content-Type',
        }
      });

    }
  }
}
