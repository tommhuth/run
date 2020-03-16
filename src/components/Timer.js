import React, { useEffect, useRef } from "react"
import { api } from "../data/store"

export default function Timer() {
    let ref = useRef()

    useEffect(() => {
        return api.subscribe((time) => { 
            ref.current.innerText = (time / 1000).toFixed(1) + "s"
        }, state => state.data.time)
    }, [])

    return (
        <div ref={ref} className="timer" />
    )
}