import { useStore } from "@data/store"
import { setState } from "@data/store/actions"
import { useEffect } from "react"

import TrafficElement from "./TrafficElement"

function Traffic() {
    const traffic = useStore(i => i.traffic)
    const loading = useStore(i => i.loading)

    useEffect(() => {
        const tid = setTimeout(() => setState({ loading: false }), 2000)

        return () => {
            clearTimeout(tid)
        }
    }, [])

    if (loading) {
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
