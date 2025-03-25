import { z } from "zod";
import { onMount } from "solid-js";
import { createDialog } from "./context-dialog";
import { Button } from "./button";


export const DialogString = createDialog({
  size: "sm",
  schema: z.object({
    title: z.string(),
    placeholder: z.string(),
    action: z.string(),
    onSubmit: z.function().args(z.string()).returns(z.void()),
  }),
  render: (ctx) => {
    let input: HTMLInputElement;
    onMount(() => {
      setTimeout(() => {
        input.focus()
        input.value = ""
      }, 50)
    })

    function submit() {
      const value = input.value.trim()
      if (value) {
        ctx.input.onSubmit(value)
        ctx.control.close()
      }
    }

    return (
      <>
        <div data-slot="header">
          <div data-slot="title">{ctx.input.title}</div>
        </div>
        <div data-slot="main">
          <input onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              submit()
            }
          }} ref={r => input = r} data-slot="input" placeholder={ctx.input.placeholder} />
        </div>
        <div data-slot="footer">
          <Button size="sm" color="ghost" onClick={() => ctx.control.close()}>Cancel</Button>
          <Button
            size="sm"
            color="secondary"
            onClick={submit}>{ctx.input.action}</Button>
        </div>
      </>
    )
  }
})


