import random from "@huth/random"
import { createContext, useCallback, useEffect, useState } from "react"

export function cyclic(list = [], randomness = .1) {
    let i = 0

    return function next() {
        let result

        if (random.boolean(randomness)) {
            result = random.pick(...list)
        } else {
            result = list[i % (list.length)]
            i++
        }

        return result
    }
}

export function getGrid({ width, depth, z, remove = [1, 4] }) {
    let grid = []
    let size = 8
    let gap = 2
    let killSize = random.integer(...remove)

    for (let x = 0; x < Math.floor(width / size); x++) {
        for (let z2 = 0; z2 < Math.floor((depth - (gap + size) * 2) / (size + gap)); z2++) {
            grid.push({
                size: 8,
                position: [
                    x * (size + gap) - (size + gap * 2),
                    0,
                    z + z2 * (size + gap) + size * 3
                ]
            })
        }
    }


    grid = shuffle(grid)
    grid = grid.slice(killSize, grid.length)

    return shuffle(grid)
}

export function shuffle(array) {
    return array.map((a) => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value)
}

export function easeInSine(x) {
    return 1 - Math.cos((x * Math.PI) / 2)
}

export function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num
} 

export function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2
}

// https://gist.github.com/xposedbones/75ebaef3c10060a3ee3b246166caab56
export function map(val, in_min, in_max, out_min, out_max) {
    return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
}

export function Only(props) {
    return props.if ? <>{props.children}</> : null
}

export function useResponsiveValue(defaultValue, breakpoints = {}) {
    let getValue = useCallback(() => {
        let resolved = defaultValue

        for (let [key, value] of Object.entries(breakpoints)) {
            if (window.matchMedia(`(max-width: ${key})`).matches) {
                resolved = value
            }
        }

        return resolved
    }, [defaultValue, breakpoints])
    let [responsiveValue, setResponsiveValue] = useState(() => getValue())

    useEffect(() => {
        let setValue = () => {
            setResponsiveValue(getValue())
        }
        let onResize = () => {
            clearTimeout(tid)
            tid = setTimeout(setValue, 150)
        }
        let tid

        window.addEventListener("resize", onResize)

        return () => {
            window.removeEventListener("resize", onResize)
        }
    }, [breakpoints, getValue])

    return responsiveValue
}

// Source: https://medium.com/@Heydon/managing-heading-levels-in-design-systems-18be9a746fa3
const Level = createContext(1)

export function Section({ children }) {
    return (
        <Level.Consumer>
            {level => <Level.Provider value={level + 1}>{children}</Level.Provider>}
        </Level.Consumer>
    )
}

export function Heading(props) {
    return (
        <Level.Consumer>
            {level => {
                let Component = `h${Math.min(level, 6)}`

                return <Component {...props} />
            }}
        </Level.Consumer>
    )
}