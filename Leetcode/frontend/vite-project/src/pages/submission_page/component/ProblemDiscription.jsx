
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Editorial from "./Editorial";
import ChatAi from "./chatAi";

const DESCRIPTION_TABS = [
  "Description",
  "Editorial",
  "Solutions",
  "Submissions",
  "Chat_AI",
];

function getDifficultyClass(difficulty) {
  switch (String(difficulty || "easy").toLowerCase()) {
    case "medium":
      return "text-amber-400";
    case "hard":
      return "text-rose-400";
    default:
      return "text-emerald-400";
  }
}

function formatReferenceCode(code) {
  const source = String(code || "")
    .replace(/\r\n/g, "\n")
    .trim();

  if (!source || source.includes("\n")) return source;

  const lines = source
    .replace(/\s*([{}])\s*/g, "\n$1\n")
    .replace(/;\s*/g, ";\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let indentation = 0;

  return lines
    .map((line) => {
      if (line === "}") {
        indentation = Math.max(0, indentation - 1);
      }

      const formattedLine = `${"  ".repeat(indentation)}${line}`;

      if (line.endsWith("{")) {
        indentation += 1;
      }

      return formattedLine;
    })
    .join("\n");
}

export default function ProblemDescriptionPanel({
  problem,
  loading,
  error,
  activeTab,
  onTabChange,
  visibleTestCases = [],
  referenceSolutions = [],
  submissions = [],
  submissionsLoading = false,
  submissionsError = "",
}) {
  const [selectedSubmissionId, setSelectedSubmissionId] =
    useState(null);

  const description =
    problem?.discription ?? "No description available.";

  const difficulty = problem?.difficulty || "Easy";

  return (
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-[#343434] bg-[#222222]">
      {/* Left panel navigation tabs */}
      <div className="flex min-h-11 shrink-0 flex-nowrap items-center justify-between gap-1 overflow-hidden border-b border-[#383838] px-3 py-1 text-xs">
        {DESCRIPTION_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`h-full shrink-0 border-b-2 px-0.5 ${
              activeTab === tab
                ? "border-sky-500 font-semibold text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab === "Description" && (
              <span className="mr-1 text-sky-400">▤</span>
            )}

            {tab === "Editorial" && (
              <span className="mr-1 text-amber-400">▧</span>
            )}

            {tab === "Solutions" && (
              <span className="mr-1 text-blue-400">⚗</span>
            )}

            {tab === "Submissions" && (
              <span className="mr-1 text-purple-400">◴</span>
            )}

            {tab === "Chat_AI" && (
              <span className="mr-1 text-purple-400">✦</span>
            )}

            {tab === "Chat_AI" ? "Chat AI" : tab}
          </button>
        ))}
      </div>

      {/* Scrollable content area */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 [scrollbar-color:#555_#222]">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Loading problem...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-300">
            {error}

            <p className="mt-2 text-xs text-gray-400">
              Check that the problem ID exists in your database and
              the problem API is working.
            </p>
          </div>
        ) : activeTab === "Description" ? (
          <>
            {/* Problem title */}
            <h1 className="text-[24px] font-semibold leading-8 tracking-tight text-white">
              {problem?.title || "Untitled Problem"}
            </h1>

            {/* Difficulty and tag */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`rounded-full bg-[#343434] px-3 py-1 font-medium ${getDifficultyClass(
                  difficulty
                )}`}
              >
                {difficulty}
              </span>

              {problem?.tag && (
                <span className="rounded-full bg-[#343434] px-3 py-1 text-gray-200">
                  {problem.tag}
                </span>
              )}
            </div>

            {/* Markdown problem description */}
            <div className="mt-6 text-[15px] leading-6 text-gray-100">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-4 leading-6">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-200">
                      {children}
                    </em>
                  ),
                  code: ({ children }) => (
                    <code className="rounded bg-[#393939] px-1 py-0.5 font-mono text-[13px] text-amber-100">
                      {children}
                    </code>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-4 ml-5 list-disc space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 ml-5 list-decimal space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="pl-1">{children}</li>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-3 mt-5 text-lg font-semibold text-white">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-2 mt-4 font-semibold text-white">
                      {children}
                    </h3>
                  ),
                  pre: ({ children }) => (
                    <pre className="mb-4 overflow-x-auto rounded-lg bg-[#303030] p-3 text-sm">
                      {children}
                    </pre>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-sky-400 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {String(description)}
              </ReactMarkdown>
            </div>

            {/* Sample testcases */}
            {visibleTestCases.length > 0 && (
              <div className="mt-7 space-y-6">
                {visibleTestCases.slice(0, 3).map((testCase, index) => (
                  <div
                    key={`${index}-${testCase?.input ?? "case"}`}
                  >
                    <h2 className="mb-3 font-semibold text-white">
                      Example {index + 1}:
                    </h2>

                    <div className="border-l-2 border-[#484848] pl-4 text-sm leading-6 text-gray-200">
                      <div>
                        <strong className="text-gray-100">
                          Input:
                        </strong>{" "}
                        <code className="break-words text-gray-300">
                          {testCase?.input ?? ""}
                        </code>
                      </div>

                      <div>
                        <strong className="text-gray-100">
                          Output:
                        </strong>{" "}
                        <code className="break-words text-gray-300">
                          {testCase?.output ?? ""}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {problem?.constraints && (
              <div className="mt-7">
                <h2 className="mb-3 font-semibold text-white">
                  Constraints:
                </h2>

                <div className="whitespace-pre-wrap text-sm leading-6 text-gray-300">
                  {problem.constraints}
                </div>
              </div>
            )}
          </>
        ) : activeTab === "Editorial" ? (
          /* Editorial video player */
          <div className="max-w-full">
            <h2 className="mb-4 text-xl font-bold text-white">
              Editorial
            </h2>

            {problem?.secureUrl ? (
              <Editorial
                secureUrl={problem.secureUrl}
                thumbnailUrl={problem.thumbnailUrl}
                duration={problem.duration}
              />
            ) : (
              <div className="rounded-lg border border-[#393939] bg-[#292929] p-4 text-sm text-gray-400">
                No editorial video is available for this problem.
              </div>
            )}
          </div>
        ) : activeTab === "Chat_AI" ? (
          /* AI chatbot */
          <div className="flex min-h-[400px] min-w-0 flex-col">
            <h2 className="mb-4 shrink-0 text-xl font-bold text-white">
              Chat with AI
            </h2>

            <div className="min-h-0 min-w-0 flex-1">
              <ChatAi problem={problem} />
            </div>
          </div>
        ) : activeTab === "Solutions" ? (
          /* Reference solutions */
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Solutions
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Official solutions for the supported languages.
              </p>
            </div>

            {referenceSolutions.length > 0 ? (
              referenceSolutions.map((solution, index) => (
                <div
                  key={`${solution?.language || "solution"}-${index}`}
                  className="overflow-hidden rounded-lg border border-[#393939] bg-[#292929]"
                >
                  <div className="border-b border-[#393939] px-4 py-3 text-sm font-semibold text-emerald-400">
                    {solution?.language || "Solution"}
                  </div>

                  <pre className="max-w-full overflow-x-auto p-4 text-sm leading-6 text-gray-200">
                    <code className="block min-w-max whitespace-pre">
                      {formatReferenceCode(
                        solution?.complete_code ||
                          "No solution code available."
                      )}
                    </code>
                  </pre>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-[#393939] bg-[#292929] p-4 text-sm text-gray-400">
                No solution has been saved for this problem.
              </p>
            )}
          </div>
        ) : (
          /* Submissions */
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Submissions
            </h2>

            {submissionsLoading && (
              <p className="text-sm text-gray-400">
                Loading submissions...
              </p>
            )}

            {submissionsError && (
              <p className="rounded-lg border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-300">
                {submissionsError}
              </p>
            )}

            {!submissionsLoading &&
              !submissionsError &&
              submissions.length === 0 && (
                <p className="rounded-lg border border-[#393939] bg-[#292929] p-4 text-sm text-gray-400">
                  No submissions found for this problem.
                </p>
              )}

            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="rounded-lg border border-[#393939] bg-[#292929] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold capitalize text-gray-200">
                      {submission.language}
                    </span>

                    <span
                      className={`font-semibold capitalize ${
                        submission.status === "accepted"
                          ? "text-emerald-400"
                          : submission.status === "pending"
                            ? "text-amber-400"
                            : "text-rose-400"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-gray-400 sm:grid-cols-3">
                    <span>
                      Tests: {submission.testCasesPassed ?? 0}/
                      {submission.testCasesTotal ?? 0}
                    </span>

                    <span>
                      Runtime: {submission.runtime ?? 0}
                    </span>

                    <span>
                      Memory: {submission.memory ?? 0} KB
                    </span>
                  </div>

                  {submission.errorMessage && (
                    <pre className="mt-3 whitespace-pre-wrap rounded bg-[#202020] p-3 text-xs text-rose-300">
                      {submission.errorMessage}
                    </pre>
                  )}

                  {submission.createdAt && (
                    <p className="mt-3 text-xs text-gray-500">
                      {new Date(
                        submission.createdAt
                      ).toLocaleString()}
                    </p>
                  )}

                  {/* Toggle the selected submission's source code */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSubmissionId(
                        selectedSubmissionId === submission._id
                          ? null
                          : submission._id
                      )
                    }
                    className="mt-3 rounded bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-500"
                  >
                    {selectedSubmissionId === submission._id
                      ? "Hide Code"
                      : "View Code"}
                  </button>

                  {selectedSubmissionId === submission._id && (
                    <pre className="mt-3 max-h-40 overflow-y-auto rounded bg-[#1a1a1a] p-3 text-xs text-gray-200">
                      <code>{submission.code}</code>
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panel footer */}
      <div className="flex h-9 shrink-0 items-center justify-between border-t border-[#383838] px-4 text-xs text-gray-400">
        <span>{problem?.likes ?? "—"}</span>
        <span>{problem?.discussionCount ?? "—"}</span>
      </div>
    </section>
  );
}
