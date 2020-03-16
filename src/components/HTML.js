import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"

// https://github.com/react-spring/react-three-fiber/blob/master/src/targets/shared/web/Dom.tsx
export default function HTML({
    children,
    className = ""
}) {
    let [root] = useState(() => {
        let element = document.createElement("div") 

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
        root.className = className
        
        ReactDOM.render(<>{children}</>, root)
    })

    return null
}