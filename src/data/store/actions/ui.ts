import random from "@huth/random"

import { Message, store } from "../store"
import { setState } from "./actions"

export function createMessage(data: Partial<Omit<Message, "text">> & { text: string }, duration = 4000) {
    const id = random.id()

    setTimeout(() => {
        setState({
            messages: store.getState().messages.filter(i => i.id !== id)
        })
    }, duration)

    setState({
        messages: [
            ...store.getState().messages,
            {
                ...data,
                id
            }
        ]
    })
}
