import { createStore, applyMiddleware, compose } from "redux"
import thunkMiddleware from "redux-thunk"
import { createLogger } from "redux-logger" 
import reducers from "./reducers"
 
export default function() {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
 
    return createStore(
        reducers,
        undefined,
        composeEnhancers(
            applyMiddleware(
                thunkMiddleware, 
                createLogger({ 
                    collapsed: true, 
                    predicate: (getState, action) => !action.type.includes("silent@xx")  
                })
            )
        )
    )
}
