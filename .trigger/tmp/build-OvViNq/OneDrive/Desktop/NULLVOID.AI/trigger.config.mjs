import {
  defineConfig
} from "../../../chunk-SZTMA6CY.mjs";
import "../../../chunk-W3IIWYRQ.mjs";
import {
  init_esm
} from "../../../chunk-CEGEFIIW.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  project: "proj_upilutkpvdwaqseracun",
  runtime: "node",
  dirs: ["trigger"],
  maxDuration: 3600,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1e3,
      maxTimeoutInMs: 1e4,
      factor: 2
    }
  },
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
