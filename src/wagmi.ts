import { Config } from "wagmi";

declare module "wagmi" {
  interface Register {
    config: Config;
  }
}
