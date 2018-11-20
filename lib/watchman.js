// Packages
import dotFs from "@dot-event/fs"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"

// Helpers
import { dryMode } from "./watchman/dry"
import { output } from "./watchman/output"
import { propsFn } from "./watchman/props"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("watchman")) {
    return options
  }

  dotFs({ events, store })
  dotLog({ events, store })
  dotSpawn({ events, store })

  events.onAny({
    "before.spawn": output,

    watchman: [
      dryMode,
      async options => {
        const { action = "watchman" } = options

        if (actions[action]) {
          await actions[action](options)
        }
      },
    ],

    watchmanSetup: () =>
      events.argv("argv", {
        alias: {
          a: ["action"],
          d: ["dry"],
          r: ["remove"],
        },
      }),
  })

  return options
}

export const actions = {
  watchman: async options => {
    const props = propsFn(options)

    const { events, store } = options
    const { remove } = store.get("argv.opts")

    const { projectPath, operations } = store.get(props())
    const { triggers } = operations.watchman

    for (const trigger of triggers) {
      const payload = ["trigger", projectPath, trigger]

      if (remove) {
        await events.spawn(props("removeWatchman"), {
          args: ["trigger-del", projectPath, trigger.name],
          command: "watchman",
        })
      } else {
        await events.spawn(props("createWatchman"), {
          args: [
            "-c",
            `watchman  -j <<-EOT\n${JSON.stringify(
              payload
            )}\nEOT`,
          ],
          command: "sh",
        })
      }
    }
  },
}
