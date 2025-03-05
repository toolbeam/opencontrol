import { StandardSchemaV1 } from "@standard-schema/spec"
import { z } from "zod"

export interface Tool<
  Args extends undefined | StandardSchemaV1 = undefined | StandardSchemaV1,
> {
  name: string
  description: string
  args?: Args
  run: Args extends StandardSchemaV1
    ? (args: StandardSchemaV1.InferOutput<Args>) => Promise<any>
    : () => Promise<any>
}

export function tool<Args extends undefined | StandardSchemaV1>(
  input: Tool<Args>,
) {
  return input
}

tool({
  name: "foo",
  description: "bar",
  args: z.object({
    foo: z.string(),
  }),
  async run(args) {},
})
