import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"

// https://github.com/react-spring/react-three-fiber/blob/master/src/targets/shared/web/Dom.tsx
export default function HTML({
    children,
    className = "",
    left,
    top,
    right,
    bottom
}) {
    let [root] = useState(() => {
        let element = document.createElement("div")

        element.style.top = top
        element.style.left = left
        element.style.right = right
        element.style.bottom = bottom
        element.className = className

        return element
    })

    useEffect(() => {
        document.body.appendChild(root)

        return () => {
            document.body.removeChild(root)
            ReactDOM.unmountComponentAtNode(root)
        }
    }, [])

    useEffect(() => {
        root.style.top = top
        root.style.left = left
        root.style.right = right
        root.style.bottom = bottom
        root.className = className
        
        ReactDOM.render(<>{children}</>, root)
    })

    return null
}