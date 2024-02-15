import { fromPromise } from "xstate";

export const mockActor = fromPromise(
  async () => {
    await new Promise<void>((resolve) =>
      setTimeout(() => {
        resolve();
      }, 1000)
    );
  }
)
export default mockActor
