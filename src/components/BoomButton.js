import React, { useState } from "react"
import cn from "classnames"

import "./style/boom-button.scss"

export default function BoomButton({ boom }) {
    let [active, setActive] = useState(false)

    return (
        <button
            className={cn("boom-button", { "boom-button--active": active })}
            type="button"
            onMouseOver={() => setActive(true)}
            onMouseOut={() => setActive(false)}
            onTouchStart={() => setActive(true)}
            onTouchEnd={() => setActive(false)}
            onTouchCancel={() => setActive(false)}
            onClick={(e) => {
                e.stopPropagation()
                boom()
            }}
        >
            Bitch
        </button>
    )
}