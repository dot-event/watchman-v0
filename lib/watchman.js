// Packages
import { argvRelay } from "@dot-event/argv"
import dotFs from "@dot-event/fs"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"
import dotStore from "@dot-event/store"

// Helpers
import { argv } from "./watchman/argv"

// Composer
export default function(options) {
  const { events } = options

  if (events.ops.has("watchman")) {
    return options
  }

  dotFs({ events })
  dotLog({ events })
  dotSpawn({ events })
  dotStore({ events })

  events
    .withOptions({
      cwd: process.cwd(),
    })
    .onAny({
      watchman: argvRelay,

      watchmanCreate: watchman,

      watchmanRemove: watchman.bind({ remove: true }),

      watchmanSetupOnce: argv,
    })

  return options
}

async function watchman(options) {
  const { events, props } = options
  const { remove } = this || {}

  const { projectPath, operations } = events.get(props)
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
