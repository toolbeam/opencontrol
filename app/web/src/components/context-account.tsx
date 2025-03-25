import { createEffect } from "solid-js";
import { createInitializedContext } from "../util/context";
import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { useOpenAuth } from "@openauthjs/solid"

type Storage = {
  accounts: Record<string, {
    id: string
    email: string
    workspaces: {
      id: string
      name: string
      slug: string
    }[]
  }>
}

export const { use: useAccount, provider: AccountProvider } = createInitializedContext("AccountContext", () => {
  const auth = useOpenAuth()
  const [store, setStore] = makePersisted(
    createStore<Storage>({
      accounts: {},
    }),
    {
      name: "radiant.account",
    },
  );

  async function refresh(id: string) {
    return fetch(import.meta.env.VITE_API_URL + "/rest/account", {
      headers: {
        authorization: `Bearer ${await auth.access(id)}`,
      },
    })
      .then(val => val.json())
      .then(val => setStore("accounts", id, val as any))
  }

  createEffect((previous: string[]) => {
    if (Object.keys(auth.all).length === 0) {
      return []
    }
    for (const item of Object.values(auth.all)) {
      if (previous.includes(item.id)) continue
      refresh(item.id)
    }
    return Object.keys(auth.all)
  }, [] as string[])



  return {
    get all() {
      return store.accounts
    },
    get current() {
      if (!auth.subject) return undefined
      return store.accounts[auth.subject.id]
    },
    refresh,
    get ready() {
      return Object.keys(auth.all).length === Object.keys(store.accounts).length
    }
  }
})

