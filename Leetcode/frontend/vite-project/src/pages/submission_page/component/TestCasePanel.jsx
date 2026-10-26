export default function TestcasePanel({
  testCases,
  activeCase,
  onCaseChange,
  activeTab,
  onTabChange,
  onRun,
  onSubmit,
  results = [],
  error = "",
  loading = false,
}) {
  // If no testcase exists at this index, use an empty object to avoid undefined errors.
  const selectedCase = testCases[activeCase] || { input: "", output: "" };

  return (
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-[#343434] bg-[#222222]">
      {/* These tabs switch the content shown in the lower-right panel. */}
      <div className="flex h-11 shrink-0 items-center gap-5 border-b border-[#383838] bg-[#292929] px-4 text-sm">
        <button
          type="button"
          onClick={() => onTabChange("Testcase")}
          className={`flex h-full items-center gap-2 border-b-2 ${
            activeTab === "Testcase"
              ? "border-emerald-500 font-semibold text-white"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-emerald-400">☑</span> Testcase
        </button>

        <button
          type="button"
          onClick={() => onTabChange("Test Result")}
          className={`flex h-full items-center gap-2 border-b-2 ${
            activeTab === "Test Result"
              ? "border-emerald-500 font-semibold text-white"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-emerald-400">›_</span> Test Result
        </button>
      </div>

      {activeTab === "Testcase" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {/* Each button picks which sample input/output should be displayed. */}
          <div className="mb-4 flex items-center gap-2 overflow-x-auto">
            {testCases.length > 0 ? (
              testCases.map((testCase, index) => (
                <button
                  key={`${index}-${testCase?.input ?? "case"}`}
                  type="button"
                  onClick={() => onCaseChange(index)}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm ${
                    activeCase === index
                      ? "bg-[#414141] font-semibold text-white"
                      : "bg-transparent text-gray-400 hover:bg-[#303030] hover:text-white"
                  }`}
                >
                  Case {index + 1}
                </button>
              ))
            ) : (
              <span className="text-xs text-gray-500">
                No visible testcases are available for this problem.
              </span>
            )}
          </div>

          {/* Display the selected testcase's input and expected output. */}
          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-400">Input</label>
              <pre className="min-h-12 whitespace-pre-wrap wrap-break-words rounded-lg bg-[#393939] px-4 py-3 font-mono text-sm text-gray-100">
                {selectedCase.input || "No input"}
              </pre>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-400">Expected output</label>
              <pre className="min-h-12 whitespace-pre-wrap wrap-break-words rounded-lg bg-[#393939] px-4 py-3 font-mono text-sm text-gray-100">
                {selectedCase.output || "No expected output"}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading && <p className="text-sm text-gray-400">Running code...</p>}
          {error && <p className="rounded-lg bg-rose-950/40 p-3 text-sm text-rose-300">{error}</p>}
          {!loading && !error && results.length === 0 && (
            <p className="text-center text-sm text-gray-400">Run your code to see the result here.</p>
          )}
          <div className="space-y-3">
            {results.map((result, index) => {
              const errorText = result?.stderr || result?.compile_output || "";
              const statusId = result?.status?.id ?? result?.status_id;
              const statusText = result?.status?.description || (statusId === 3 ? "Accepted" : "Failed");

              return (
                <div key={`${index}-${result?.token || "result"}`} className="rounded-lg bg-[#303030] p-3 text-sm">
                  <div className="mb-2 flex justify-between font-medium text-gray-200">
                    <span>Case {index + 1}</span>
                    <span className={statusId === 3 ? "text-emerald-400" : "text-rose-400"}>
                      {statusText}
                    </span>
                  </div>
                  <div className="grid gap-2 text-xs text-gray-400 sm:grid-cols-2">
                    <pre className="whitespace-pre-wrap">
                      Output: {result?.stdout || result?.output || "—"}
                    </pre>
                    {errorText && (
                      <pre className="whitespace-pre-wrap text-rose-300">
                        Error: {errorText}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex h-12 shrink-0 items-center justify-between border-t border-[#383838] px-4">
        <div className="text-xs text-gray-500">Source</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRun}
            className="rounded-lg bg-[#3a3a3a] px-4 py-2 text-sm font-medium text-white hover:bg-[#484848]"
          >
            ▶ Run
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            ☁ Submit
          </button>
        </div>
      </div>
    </section>
  );
}
