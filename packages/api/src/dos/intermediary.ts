import { Env } from "../types/env";
import { BusyState } from "../types/intermediary";
import { sendRequest } from "../services/request";

async function delayAndResolve(milliseconds = 1000000) {
  await new Promise(resolve => setTimeout(resolve, milliseconds));

  return {
    data: "Mock data",
    errors: false,
  }
}

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

    if (currentState) {
      return new Response("The pod is busy");
    }

    await this.updateCurrentState(true);

    const {
      data,
      errors,
    } = await sendRequest(args, this.env);

    if (errors) {
      throw new Error(JSON.stringify(errors))
    }

    await this.updateCurrentState(false);

    return new Response(JSON.stringify(data));
  }
}
