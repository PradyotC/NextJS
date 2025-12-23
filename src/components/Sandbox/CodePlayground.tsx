"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { Snippet } from "@/lib/server/github-fetcher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay,
    faTerminal,
    faCode,
    faBookOpen,
    faEraser,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";

export default function CodePlayground({ snippet }: { snippet: Snippet }) {
    const [code, setCode] = useState(snippet.code);
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    // Mobile State: Toggle between 'problem' and 'editor' tabs
    const [mobileTab, setMobileTab] = useState<'problem' | 'editor'>('problem');

    async function handleRun() {
        setIsRunning(true);
        // Auto-switch to editor tab on mobile so user sees the terminal
        if (window.innerWidth < 1024) setMobileTab('editor');

        setOutput("Running remote execution...");

        try {
            const res = await fetch("/api/sandbox/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language: snippet.language, code }),
            });
            const data = await res.json();
            setOutput(data.output);
        } catch (e) {
            setOutput(`Error connecting to server.\n${e}`);
        } finally {
            setIsRunning(false);
        }
    }

    return (
        // Container: Use 100dvh (dynamic viewport height) to handle mobile browser address bars correctly
        <div className="flex h-full rounded-lg overflow-auto border border-2 border-primary/50">
            <div className="flex flex-col h-full w-full bg-base-200">

                {/* MOBILE TABS: Only visible on screens smaller than 'lg' */}
                <div className="lg:hidden flex-none border-b border-base-300 bg-base-200">
                    <div className="tabs tabs-boxed bg-transparent justify-center p-2">
                        <button
                            className={`tab gap-2 ${mobileTab === 'problem' ? 'tab-active' : ''}`}
                            onClick={() => setMobileTab('problem')}
                        >
                            <FontAwesomeIcon icon={faBookOpen} className="h-4 w-4" />
                            Problem
                        </button>
                        <button
                            className={`tab gap-2 ${mobileTab === 'editor' ? 'tab-active' : ''}`}
                            onClick={() => setMobileTab('editor')}
                        >
                            <FontAwesomeIcon icon={faCode} className="h-4 w-4" />
                            Code & Run
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                    {/* --- LEFT PANEL: Description --- */}
                    {/* Mobile: Hidden unless 'problem' tab is active. Desktop: Always visible (1/3 width) */}
                    <div className={`
            w-full lg:w-1/3 bg-base-200/50 border-r border-base-300 flex flex-col
            ${mobileTab === 'problem' ? 'flex' : 'hidden lg:flex'}
        `}>
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <h1 className="text-2xl font-bold mb-4 text-primary">{snippet.title}</h1>
                            <article className="flex flex-col prose prose-sm dark:prose-invert max-w-none gap-5">
                                <ReactMarkdown>{snippet.description}</ReactMarkdown>
                            </article>
                        </div>
                    </div>

                    {/* --- RIGHT PANEL: Editor & Terminal --- */}
                    {/* Mobile: Hidden unless 'editor' tab is active. Desktop: Always visible (2/3 width) */}
                    <div className={`
            w-full lg:w-2/3 flex flex-col h-full relative bg-[#1e1e1e]
            ${mobileTab === 'editor' ? 'flex' : 'hidden lg:flex'}
        `}>

                        {/* Toolbar */}
                        <div className="h-12 flex-none border-b border-[#333] bg-[#252526] flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <div className="badge badge-neutral font-mono text-xs">
                                    {snippet.language === "go" ? "main.go" : "main.py"}
                                </div>
                            </div>

                            <button
                                onClick={handleRun}
                                disabled={isRunning}
                                className={`btn btn-sm gap-2 font-bold ${isRunning ? "btn-disabled opacity-50" : "btn-success text-white hover:scale-105 transition-transform"}`}
                            >
                                {isRunning ? (
                                    <FontAwesomeIcon icon={faSpinner} className="h-3 w-3 animate-spin" />
                                ) : (
                                    <FontAwesomeIcon icon={faPlay} className="h-3 w-3" />
                                )}
                                {isRunning ? "Running..." : "Run Code"}
                            </button>
                        </div>

                        {/* Monaco Editor */}
                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                defaultLanguage={snippet.language}
                                defaultValue={snippet.code}
                                theme="vs-dark"
                                onChange={(val) => setCode(val || "")}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    padding: { top: 16 },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true, // Critical for resizing between desktop/mobile
                                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                }}
                            />
                        </div>

                        {/* Terminal Output */}
                        <div className="h-1/3 min-h-[150px] flex-none border-t border-[#333] flex flex-col bg-[#1e1e1e]">
                            <div className="flex-none px-4 py-1 bg-[#252526] flex justify-between items-center select-none border-b border-[#333]">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                    <FontAwesomeIcon icon={faTerminal} className="h-3 w-3" />
                                    <span>CONSOLE OUTPUT</span>
                                </div>
                                <button
                                    onClick={() => setOutput("")}
                                    className="btn btn-ghost btn-xs text-gray-500 hover:text-white tooltip tooltip-left"
                                    data-tip="Clear Console"
                                >
                                    <FontAwesomeIcon icon={faEraser} className="h-3 w-3" />
                                </button>
                            </div>
                            <pre className="flex-1 p-4 font-mono text-sm text-green-400 overflow-auto whitespace-pre-wrap leading-relaxed custom-scrollbar selection:bg-green-900 selection:text-white">
                                {output || <span className="text-gray-600 italic">{`Click "Run Code" to see output...`}</span>}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}