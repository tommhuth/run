import { bindActionCreators } from "redux"
import { useDispatch } from "react-redux"
import { useMemo } from "react"
import { throttle } from "throttle-debounce"
import { useRender } from "react-three-fiber"

export function useActions(actions = {}, deps = []) {
    const dispatch = useDispatch()

    return useMemo(() => {
        let result = {}

        for (let action of Object.keys(actions)) {
            result[action] = bindActionCreators(actions[action], dispatch)
        } 
        
        return result
    }, [dispatch, ...deps])
}


export function useThrottledRender(callback, delay = 100, deps = [], noTrailing = false) {
    let throttledCallback = useMemo(() => throttle(delay, noTrailing, callback), deps)

    useRender(throttledCallback, false, deps)
}
