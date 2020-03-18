import React, { useEffect, useRef } from "react"
import { api } from "../data/store" 

import "./style/runner-stats.scss"

export default function RunnerStats() { 
    let timerRef = useRef()
    let distanceRef = useRef()

    useEffect(() => {
        return api.subscribe((time) => {
            let formattedTime = Math.floor(time / 1000)

            timerRef.current.innerHTML = formattedTime  
        }, state => state.data.time)
    }, [])

    useEffect(() => {
        return api.subscribe((distance) => {
            distanceRef.current.innerHTML = Math.max(distance - 40, 0)  
        }, state => Math.floor(state.data.position.z))
    }, [])

    return (
        <> 
            <div className="runner-stats runner-stats--right" >
                <span className="runner-stats__value" ref={timerRef}>20</span>
                <span className="runner-stats__label">seconds</span>
            </div>
            <div className="runner-stats runner-stats--left" >
                <span className="runner-stats__value" ref={distanceRef}>0</span>
                <span className="runner-stats__label">meters</span>
            </div> 
        </>
    )
}