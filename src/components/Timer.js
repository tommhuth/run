import React, { useEffect, useRef } from "react"
import { api } from "../data/store"

export default function Timer() {
    let ref = useRef()

    useEffect(() => {
        return api.subscribe((time) => {
            let formattedTime = Math.floor(time / 1000)

            ref.current.innerHTML = formattedTime + " <span>seconds</span>"
        }, state => state.data.time)
    }, [])

    return (
        <div ref={ref} className="timer">
            20 <span>meters</span>
        </div>
    )
}