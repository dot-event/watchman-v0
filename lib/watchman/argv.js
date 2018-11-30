export async function argv({ events }) {
  return await events.argv({
    alias: {
      c: ["create"],
      d: ["dry"],
      r: ["remove"],
    },
  })
}
