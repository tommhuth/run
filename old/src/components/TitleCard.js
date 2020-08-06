import React from "react"
import cn from "classnames"

import "./style/title-card.scss"

export default function TitleCard({ lines = [], big }) {
    return (
        <div className={cn("title-card", { "title-card--big": big })}>
            {lines.map((j, index) => {
                return (
                    <React.Fragment key={j}>
                        {j.split("").map((i, index) => {
                            return <span className="title-card__letter" key={j + index}>{i}</span>
                        })}
                        {index === lines.length - 1 ? null : <br />}
                    </React.Fragment>
                )
            })}
        </div>
    )
}