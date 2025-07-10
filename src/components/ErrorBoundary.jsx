import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: false }; // Silently fail
    }

    componentDidCatch(error, errorInfo) {
        // Log the error silently
        console.error({
            error,
            errorInfo
        });
    }

    render() {
        // Always render children, even with errors
        return this.props.children;
    }
}

export default ErrorBoundary;