import { promisify } from "util";
import { execFile as execFileCallback } from "child_process";

export const execFile = promisify(execFileCallback);
