import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ color: "red", padding: "20px" }}>
                    <h1>React Runtime Error</h1>
                    <pre>{this.state.error?.message}</pre>
                    <pre>{this.state.error?.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

try {
    createRoot(document.getElementById("root")!).render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
} catch (e) {
    document.getElementById("root")!.innerHTML = `<div style="color:red; padding: 20px;"><h1>React Error</h1><pre>${(e as Error).message}</pre></div>`;
}
