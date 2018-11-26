// Packages
import dotEvent from "dot-event"
import dotTask from "@dot-event/task"

// Helpers
import dotWatchman from "../"

// Variables
let events

// Tests
beforeEach(async () => {
  events = dotEvent()

  dotTask({ events })
  dotWatchman({ events })

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

  await run("--create")

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
