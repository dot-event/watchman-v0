import dotEvent from "dot-event"
import dotStore from "@dot-event/store"
import dotTask from "@dot-event/task"

import dotWatchman from "../dist/watchman"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore({ events })

  dotWatchman({ events, store })
  dotTask({ events, store })

  events.onAny({
    "before.spawn": ({ event }) => {
      event.signal.cancel = true
    },
  })
})

async function run(...argv) {
  await events.task({
    argv,
    op: "watchman",
    path: `${__dirname}/fixture`,
  })
}

test("watchman", async () => {
  const args = []

  events.onAny({
    "before.spawn": ({ event }) => args.push(event.args[0]),
  })

  await run()

  expect(args).toEqual([
    {
      args: [
        "-c",
        `watchman  -j <<-EOT\n["trigger","${__dirname}/fixture/project-a",{"name":"babel","expression":["anyof",["match","lib/**/*.js","wholename"]],"command":["npm","run","build"]}]\nEOT`,
      ],
      command: "sh",
    },
  ])
})
