import { useStore } from "@data/store"
import { useEffect, useState } from "react"

import TrafficElement from "./TrafficElement"

function Traffic() {
    const traffic = useStore(i => i.traffic)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const tid = setTimeout(() => setReady(true), 3000)

        return () => {
            clearTimeout(tid)
        }
    }, [])

    if (!ready) {
        return null
    }

    return traffic.map(item => {
        return (
            <TrafficElement
                {...item}
                key={item.id}
            />
        )
    })
};

export default Traffic
