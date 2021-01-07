import React from "react"

export default class ErrorBoundary extends React.Component {
    state = { hasError: false }

    static getDerivedStateFromError() { 
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) { 
        console.log(error, errorInfo)
    }

    render() {
        if (this.state.hasError) { 
            return null
        }

        return this.props.children
    }
}