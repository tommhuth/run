import { useEffect, useRef } from "react"
import { api } from "../data/store" 

import "./style/runner-stats.scss"

export default function RunnerStats() {  
    let distanceRef = useRef() 

    useEffect(() => {
        return api.subscribe((distance) => {
            if (distanceRef.current) {
                distanceRef.current.innerHTML = Math.max(distance, 0).toLocaleString()
            }
        }, state => Math.floor(state.position.z))
    }, [])

    return (
        <>  
            <div className="runner-stats runner-stats--left" >
                <span className="runner-stats__value" ref={distanceRef}>0</span>
                <span className="runner-stats__label">meters</span>
            </div> 
        </>
    )
}