import create from "zustand"
import getInitState from "./getInitState"
import getActions from "./getActions"

const [useStore, api] = create((set, get) => {
    return {
        data: getInitState(),
        actions: getActions(
            () => get().data,
            (data) => {
                set({
                    data: {
                        ...get().data,
                        ...data
                    }
                })
            },
            () => get().actions
        )
    }
}) 

export { useStore, api }