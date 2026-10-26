import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { LANGUAGES } from "./ProblemUtils";

export default function CodeEditorPanel({
  language,
  code,
  onLanguageChange,
  onCodeChange,
  onReset,
}) //arguments take from problemPage.jsx parent function
{
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState("on");

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") setIsExpanded(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Monaco's language option is the language ID it uses for syntax highlighting.
  const editorLanguage =
    LANGUAGES.find((item) => item.value === language)?.editorLanguage || "cpp";

  return (
    <section className={`flex min-h-0 min-w-0 flex-col overflow-hidden border border-[#343434] bg-[#1e1e1e] ${
      isExpanded
        ? "fixed inset-3 z-50 rounded-xl shadow-2xl"
        : "rounded-xl"
    }`}>
      {/* Editor title and toolbar. */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#383838] bg-[#292929] px-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="text-emerald-400">‹/›</span> Code
        </div>

        <div className="relative flex items-center gap-2 text-gray-400">
          <button
            type="button"
            aria-label="Editor menu"
            aria-expanded={showMenu}
            onClick={() => {
              setShowMenu((visible) => !visible);
              setShowSettings(false);
            }}
            className="px-1 hover:text-white"
          >☰</button>
          <button
            type="button"
            aria-label="Bookmark editor"
            aria-pressed={isBookmarked}
            onClick={() => setIsBookmarked((bookmarked) => !bookmarked)}
            className={`px-1 hover:text-white ${isBookmarked ? "text-amber-400" : ""}`}
          >{isBookmarked ? "★" : "♧"}</button>
          <button
            type="button"
            aria-label="Editor settings"
            aria-expanded={showSettings}
            onClick={() => {
              setShowSettings((visible) => !visible);
              setShowMenu(false);
            }}
            className="px-1 hover:text-white"
          >{"{}"}</button>
          <button type="button" aria-label="Reset editor" onClick={onReset} className="px-1 hover:text-white">↶</button>
          <button
            type="button"
            aria-label={isExpanded ? "Collapse editor" : "Expand editor"}
            aria-pressed={isExpanded}
            onClick={() => setIsExpanded((expanded) => !expanded)}
            className="px-1 hover:text-white"
          >{isExpanded ? "⤡" : "⤢"}</button>

          {showMenu && (
            <div className="absolute right-20 top-8 z-20 w-40 rounded-md border border-[#444] bg-[#252525] p-1 text-left text-xs shadow-xl">
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setShowMenu(false);
                }}
                className="block w-full rounded px-3 py-2 text-left text-gray-200 hover:bg-[#383838]"
              >
                Reset code
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBookmarked((bookmarked) => !bookmarked);
                  setShowMenu(false);
                }}
                className="block w-full rounded px-3 py-2 text-left text-gray-200 hover:bg-[#383838]"
              >
                {isBookmarked ? "Remove bookmark" : "Bookmark code"}
              </button>
            </div>
          )}

          {showSettings && (
            <div className="absolute right-10 top-8 z-20 w-48 rounded-md border border-[#444] bg-[#252525] p-3 text-left text-xs shadow-xl">
              <label className="flex items-center justify-between gap-3 text-gray-200">
                Font size
                <select
                  value={fontSize}
                  onChange={(event) => setFontSize(Number(event.target.value))}
                  className="rounded bg-[#383838] px-1 py-1 text-gray-200"
                >
                  <option value={12}>12</option>
                  <option value={14}>14</option>
                  <option value={16}>16</option>
                  <option value={18}>18</option>
                </select>
              </label>
              <label className="mt-3 flex items-center justify-between gap-3 text-gray-200">
                Word wrap
                <input
                  type="checkbox"
                  checked={wordWrap === "on"}
                  onChange={(event) => setWordWrap(event.target.checked ? "on" : "off")}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Language dropdown. Changing it also lets the parent replace the starter code. */}
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-[#2d2d2d] bg-[#222222] px-4">
        <label htmlFor="problem-language-select" className="sr-only">Programming language</label>
        <select
          id="problem-language-select"
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          className="cursor-pointer bg-transparent text-sm text-gray-200 outline-none"
        >
          {LANGUAGES.map((item) => (
            <option key={item.value} value={item.value} className="bg-[#252525]">
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Monaco takes all remaining vertical space in this panel. */}
      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          language={editorLanguage}
          theme="vs-dark"
          value={code}
          onChange={(nextCode) => onCodeChange(nextCode ?? "")}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            wordWrap,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: "line",
            suggestOnTriggerCharacters: true,
          }}
        />
      </div>

      {/* Lightweight status bar, similar to the reference screenshot. */}
      <div className="flex h-7 shrink-0 items-center justify-between border-t border-[#333] px-3 text-xs text-gray-500">
        <span>Editor ready</span>
        <span>Ln 1, Col 1</span>
      </div>
    </section>
  );
}
