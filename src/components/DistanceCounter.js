import React, { useEffect, useRef } from "react"
import { api } from "../data/store"

export default function DistanceCounter() {
    let ref = useRef()

    useEffect(() => {
        return api.subscribe((distance) => {
            ref.current.innerHTML = Math.max(distance - 40, 0) + " <span>meters</span>"
        }, state => Math.floor(state.data.position.z))
    }, [])

    return (
        <div ref={ref} className="distance-counter" />
    )
}