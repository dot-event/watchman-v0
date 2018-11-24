// Packages
import { argvRelay } from "@dot-event/argv"
import dotFs from "@dot-event/fs"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"

// Helpers
import { dryMode } from "./watchman/dry"
import { output } from "./watchman/output"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("watchman")) {
    return options
  }

  dotFs({ events, store })
  dotLog({ events, store })
  dotSpawn({ events, store })

  events
    .withOptions({
      cwd: process.cwd(),
    })
    .onAny({
      "before.spawn": output,

      watchman: argvRelay,

      watchmanCreate: [dryMode, watchman],

      watchmanRemove: [
        dryMode,
        watchman.bind({ remove: true }),
      ],

      watchmanSetup: () =>
        events.argv({
          alias: {
            a: ["action"],
            c: ["create"],
            d: ["dry"],
            r: ["remove"],
          },
        }),
    })

  return options
}

async function watchman(options) {
  const { events, props, store } = options
  const { remove } = this || {}

  const { projectPath, operations } = store.get(props)
  const { triggers } = operations.watchman

  for (const trigger of triggers) {
    const payload = ["trigger", projectPath, trigger]

    if (remove) {
      await events.spawn([...props, "removeWatchman"], {
        args: ["trigger-del", projectPath, trigger.name],
        command: "watchman",
      })
    } else {
      await events.spawn([...props, "createWatchman"], {
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
}
