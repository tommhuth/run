import { useStore } from "@data/store/store"

import TrafficElement from "./TrafficElement"

function Traffic() {
    const traffic = useStore(i => i.traffic)


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
