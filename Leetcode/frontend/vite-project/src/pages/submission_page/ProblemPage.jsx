import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../../utils/axios";
import { initializeCode, resetCode, setCode } from "../../slice/editorSlice";
import ProblemDescriptionPanel from "./component/ProblemDiscription";
import CodeEditorPanel from "./component/CodeEditor_panel";
import TestcasePanel from "./component/TestCasePanel";
import { getStarterCode, getVisibleTestCases, normalizeLanguage } from "./component/ProblemUtils";

function decodeJudge0Text(value) {
  if (!value) return "";

  try {
    const binary = window.atob(value);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return value;
  }
}

function decodeExecutionResults(results) {
  return results.map((result) => ({
    ...result,
    stdout: decodeJudge0Text(result?.stdout),
    stderr: decodeJudge0Text(result?.stderr),
    compile_output: decodeJudge0Text(result?.compile_output),
  }));
}

export default function ProblemPage() {
  // Read the ID from a route such as /problem/:problemid.
  const { problemid, problemId: alternateProblemId } = useParams();
  const problemId = problemid || alternateProblemId;
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  // Problem data and page loading/error states.
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [executionResults, setExecutionResults] = useState([]);
  const [executionError, setExecutionError] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [solvedProblemsLoading, setSolvedProblemsLoading] = useState(false);
  const [solvedProblemsError, setSolvedProblemsError] = useState("");
  const [showSolvedProblems, setShowSolvedProblems] = useState(false);

  // State shared by the left and bottom panels.
  const [activeDescriptionTab, setActiveDescriptionTab] = useState("Description");
  const [activeBottomTab, setActiveBottomTab] = useState("Testcase");
  const [activeCase, setActiveCase] = useState(0);

  // State shared with Monaco Editor and the language dropdown.
  const [language, setLanguage] = useState("cpp");
  const savedCode = useSelector(
    (state) => state.editor.codeByProblem[problemId]?.[language]
  );
  const code = savedCode ?? getStarterCode(problem, language);

  // Load the problem when the URL's problem ID changes.
  useEffect(() => {
    let cancelled = false;

    async function fetchProblem() {
      setLoading(true);
      setLoadError("");

      try {
        const { data } = await axiosClient.get(`/problem/problem_getById/${problemId}`);
        const foundProblem = data?.getProblemById || data?.problem || data;

        if (!foundProblem) {
          throw new Error("This problem could not be found.");
        }

        // Do not update React state if the user navigated away before the request finished.
        if (!cancelled) {
          setProblem(foundProblem);
          setActiveCase(0);
          setLanguage("cpp");
          dispatch(initializeCode({
            problemId,
            language: "cpp",
            code: getStarterCode(foundProblem, "cpp"),
          }));
          setExecutionResults([]);
          setExecutionError("");
        }
      } catch (error) {
        if (!cancelled) {
          const responseMessage = error?.response?.data?.message;
          const responseText = typeof error?.response?.data === "string"
            ? error.response.data
            : "";
          setLoadError(
            responseMessage || responseText || error?.message || "Unable to load this problem."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!problemId) {
      setLoadError("Problem ID is missing from the URL.");
      setLoading(false);
    } else {
      fetchProblem();
    }

    // Cleanup prevents an old request from updating state after navigation.
    return () => {
      cancelled = true;
    };
  }, [dispatch, problemId]);

  useEffect(() => {
    if (!problemId || !problem) return;

    dispatch(initializeCode({
      problemId,
      language,
      code: getStarterCode(problem, language),
    }));
  }, [dispatch, language, problem, problemId]);

  useEffect(() => {
    if (!problemId || activeDescriptionTab !== "Submissions") return undefined;

    let cancelled = false;

    async function fetchSubmissions() {
      setSubmissionsLoading(true);
      setSubmissionsError("");

      try {
        const { data } = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        const savedSubmissions = data?.submissions || (Array.isArray(data) ? data : []);
        if (!cancelled) setSubmissions(savedSubmissions);
      } catch (error) {
        if (!cancelled) {
          setSubmissionsError(
            error?.response?.data?.message ||
            error?.message ||
            "Unable to load submissions."
          );
        }
      } finally {
        if (!cancelled) setSubmissionsLoading(false);
      }
    }

    void fetchSubmissions();

    return () => {
      cancelled = true;
    };
  }, [activeDescriptionTab, problemId]);

  // Convert the saved testcase data to one predictable array for the child component.
  const visibleTestCases = getVisibleTestCases(problem);

  // Change both the selected language and the starter code shown in Monaco.
  function handleLanguageChange(nextLanguage) {
    const normalizedNextLanguage = normalizeLanguage(nextLanguage);
    setLanguage(normalizedNextLanguage);
    dispatch(initializeCode({
      problemId,
      language: normalizedNextLanguage,
      code: getStarterCode(problem, normalizedNextLanguage),
    }));
  }

  async function executeCode(endpoint) {
    setActiveBottomTab("Test Result");
    setIsExecuting(true);
    setExecutionError("");

    try {
      const { data } = await axiosClient.post(`/problem/${endpoint}/${problemId}`, {
        code,
        language: normalizeLanguage(language),
      });
      const results = Array.isArray(data)
        ? data
        : data?.results || data?.testResults || [];
      setExecutionResults(decodeExecutionResults(results));
      if (endpoint === "submit") {
        setActiveDescriptionTab("Submissions");
      }
    } catch (error) {
      setExecutionResults([]);
      setExecutionError(
        error?.response?.data?.message ||
        error?.message ||
        "Code execution failed."
      );
    } finally {
      setIsExecuting(false);
    }
  }

  function handleRunClick() {
    void executeCode("run");
  }

  function handleSubmitClick() {
    void executeCode("submit");
  }

  async function handleProfileClick() {
    const willShowProfile = !showProfile;
    setShowProfile(willShowProfile);

    if (!willShowProfile || solvedProblems.length > 0 || solvedProblemsLoading) return;

    setSolvedProblemsLoading(true);
    setSolvedProblemsError("");

    try {
      const { data } = await axiosClient.get("/problem/solvedProblem");
      setSolvedProblems(Array.isArray(data) ? data : data?.problems || []);
    } catch (error) {
      setSolvedProblemsError(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load solved problems."
      );
    } finally {
      setSolvedProblemsLoading(false);
    }
  }

  return (
    <main className="h-screen min-h-170 overflow-hidden bg-[#171717] text-[#eeeeee]">
      {/* Top navigation bar; the controls here are visual placeholders for now. */}
      <header className="flex h-14 items-center justify-between border-b border-[#303030] bg-[#1d1d1d] px-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 text-sm font-semibold text-white hover:text-amber-300"
          >
            <span className="text-2xl leading-none text-amber-400">‹</span>
            <span className="hidden sm:inline">CodeArena</span>
          </Link>

          <span className="hidden h-6 border-l border-[#444] md:block" />
          <span className="truncate text-sm font-semibold">Daily Question</span>
        </div>

        <div className="relative flex shrink-0 items-center gap-2 sm:gap-3">
          <button type="button" onClick={handleSubmitClick} className="rounded-md bg-emerald-700/30 px-3 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-700/40">☁ Submit</button>
          <button
            type="button"
            aria-label="Open profile"
            aria-expanded={showProfile}
            onClick={() => void handleProfileClick()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#353535] text-sm font-semibold text-gray-200 hover:bg-[#454545]"
          >
            {user?.firstName?.charAt(0)?.toUpperCase() || "●"}
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 z-30 w-64 rounded-xl border border-[#414141] bg-[#252525] p-4 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-[#3b3b3b] pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700/30 font-semibold text-emerald-400">
                  {user?.firstName?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User"}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {user?.emailId || user?.emailid || "No email available"}
                  </p>
                </div>
              </div>
              <div className="space-y-2 pt-3 text-sm text-gray-300">
                <p><span className="text-gray-500">Role:</span> {user?.role || "user"}</p>
                <button
                  type="button"
                  onClick={() => setShowSolvedProblems((visible) => !visible)}
                  className="text-left hover:text-emerald-300"
                >
                  <span className="text-gray-500">Solved:</span>{" "}
                  {solvedProblemsLoading ? "Loading..." : `${solvedProblems.length} problems`}
                </button>
                {solvedProblemsError && (
                  <p className="text-xs text-rose-300">{solvedProblemsError}</p>
                )}
                {showSolvedProblems && !solvedProblemsLoading && !solvedProblemsError && (
                  <div className="max-h-40 overflow-y-auto rounded-md bg-[#1d1d1d] p-2 text-xs">
                    {solvedProblems.length === 0 ? (
                      <p className="text-gray-500">No solved problems yet.</p>
                    ) : (
                      solvedProblems.map((solvedProblem) => (
                        <p key={solvedProblem._id} className="border-b border-[#333] py-1 last:border-0">
                          {solvedProblem.title || "Untitled problem"}
                        </p>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main workspace: problem statement on the left, editor and tests on the right. */}
      <div className="grid h-[calc(100vh-56px)] min-h-0 grid-cols-1 gap-2 p-2 lg:grid-cols-[minmax(420px,40%)_minmax(0,1fr)]">
        <ProblemDescriptionPanel
          problem={problem}
          loading={loading}
          error={loadError}
          activeTab={activeDescriptionTab}
          onTabChange={setActiveDescriptionTab}
          visibleTestCases={visibleTestCases}
          referenceSolutions={problem?.ref_solution ?? []}
          submissions={submissions}
          submissionsLoading={submissionsLoading}
          submissionsError={submissionsError}
        />

        {/* The right side stacks the Monaco editor above the testcase/result panel. */}
        <section className="grid min-h-0 min-w-0 grid-rows-[minmax(300px,1.05fr)_minmax(230px,0.95fr)] gap-2 overflow-hidden">
          <CodeEditorPanel
            language={language}
            code={code}
            onLanguageChange={handleLanguageChange}
            onCodeChange={(nextCode) => dispatch(setCode({
              problemId,
              language,
              code: nextCode,
            }))}
            onReset={() => dispatch(resetCode({
              problemId,
              language,
              code: getStarterCode(problem, language),
            }))}
          />

          <TestcasePanel
            testCases={visibleTestCases}
            activeCase={activeCase}
            onCaseChange={setActiveCase}
            activeTab={activeBottomTab}
            onTabChange={setActiveBottomTab}
            onRun={handleRunClick}
            onSubmit={handleSubmitClick}
            results={executionResults}
            error={executionError}
            loading={isExecuting}
          />
        </section>
      </div>
    </main>
  );
}
