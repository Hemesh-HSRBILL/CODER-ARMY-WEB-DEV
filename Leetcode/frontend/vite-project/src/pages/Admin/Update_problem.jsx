import { useState } from "react";
import { useNavigate } from "react-router";
import { axiosClient } from "../../utils/axios";

const createTestCase = ()=>({
    input:"",
    output:"",
    Explanation:"",
});

const createStartCode = ()=>({
    language:"Javascript",
    code:"",
});

const createReferenceSolution = () => ({
    language: "javascript",
    complete_code: ""
});

const emptyProblem = () => ({
    title: "",
    discription: "",
    tag: "",
    difficulty: "easy",
    visible_testcases: [createTestCase()],
    hidden_testcases: [createTestCase()],
    start_code: [createStartCode()],
    ref_solution: [createReferenceSolution()]
});

export default function UpdateProblem() {
    const navigate = useNavigate();
    const [problemId, setProblemId] = useState("");
    const [problem , setProblem] = useState(emptyProblem());
    const [isLoaded, setIsLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Search problem by MongoDB ID.
    const handleSearch = async(e)=>{
        e.preventDefault();

        setIsLoaded(false);
        setLoading(true);
        setMessage("");
        setError("");

        try{
            const response = await axiosClient.get(
                `/problem/problem_getById/${problemId.trim()}`
            );

            const data =
                response.data?.getProblemById ||
                response.data?.problem ||
                response.data;

            if (!data?._id) {
                throw new Error("Problem data was not returned by the server.");
            }

            // Load all editable properties into form state.

            setProblem({

                title:data.title ?? "",
                discription:data.discription ?? "",
                tag:data.tag ?? "",
                difficulty:data.difficulty ?? "easy",

                visible_testcases: Array.isArray(data.visible_testcases) && data.visible_testcases.length
                    ? data.visible_testcases
                    : [createTestCase()],
                hidden_testcases: Array.isArray(data.hidden_testcases) && data.hidden_testcases.length
                    ? data.hidden_testcases
                    : [createTestCase()],

                start_code: Array.isArray(data.start_code) && data.start_code.length
                    ? data.start_code
                    : [createStartCode()],
                ref_solution: Array.isArray(data.ref_solution) && data.ref_solution.length
                    ? data.ref_solution
                    : [createReferenceSolution()],

            })

            setIsLoaded(true);
            setMessage("Problem loaded. You can now edit it.");
        }catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to find the problem. Check the ID."
            );
        } finally {
            setLoading(false);
        }
    };

    // Update basic properties.

    const updateField = (field, value) => {
        setProblem(prev =>({
            ...prev,
            [field]:value,
        }))
    }

     // Update an item in an array, such as a testcase.

    const updateArrayField = (arrayName , index , field ,value)=>{
        setProblem(prev => ({
            ...prev,
            [arrayName]:prev[arrayName].map((item , i)=>{
                return i === index
                    ? {...item , [field]:value }
                    : item;
            })
        }))
    };

    // Add an item to any dynamic array.

    const addItem =(arrayName)=>{
        const factories ={
            visible_testcases : createTestCase,
            hidden_testcases : createTestCase,
            start_code : createStartCode,
            ref_solution : createReferenceSolution,
        }

        setProblem(prev =>({
            ...prev,
            [arrayName]:[
                ...prev[arrayName],
                factories[arrayName]()
            ]
        }));

    };

    // Remove an item, keeping at least one.

    const removeItem = (arrayName, index) => {
        setProblem((prev) => {
            if (prev[arrayName].length <= 1) {
                return prev;
            }

            return {
                ...prev,
                [arrayName]: prev[arrayName].filter(
                    (_, i) => i !== index
                )
            };
            });
        };

        // Save the updated problem

        const handleUpdate = async(e)=>{
            e.preventDefault();

            setUpdating(true);
            setMessage("");
            setError("");

            try{
                const response = await axiosClient.put(
                    `/problem/update/${problemId.trim()}`,
                    problem
                );

                setMessage(
                response.data?.message ||
                "Problem updated successfully."
            );
            // Refresh form with the saved document.
            const saved = response.data.problem;

            if (saved) {
                setProblem((prev) => ({
                    ...prev,
                    title: saved.title,
                    discription: saved.discription,
                    tag: saved.tag,
                    difficulty: saved.difficulty,
                    visible_testcases: saved.visible_testcases,
                    hidden_testcases: saved.hidden_testcases,
                    start_code: saved.start_code,
                    ref_solution: saved.ref_solution
                }));
            }
        } catch (err) {
            const data = err.response?.data ?? {};
            const details = [
                data.error,
                data.compile_output,
                data.output,
            ]
                .filter(Boolean)
                .join("\n");

            setError(
                data?.message ||
                data?.error ||
                "Problem update failed."
            );
            if (details) {
                setError(`${data.message || "Problem update failed."}\n${details}`);
            }
        } finally {
            setUpdating(false);
        }
    };

    // Render a dynamic testcase section.

    const renderTestCases = (arrayName, heading) => (
        <section className="space-y-4 rounded-xl border p-4">
            <h2 className="text-xl font-semibold">{heading}</h2>

            {problem[arrayName].map((testcase, index) => (
                <div
                    key={`${arrayName}-${index}`}
                    className="space-y-3 rounded-lg bg-base-200 p-4 text-base-content"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium">
                            Test Case {index + 1}
                        </h3>

                        <button
                            type="button"
                            onClick={() =>
                                removeItem(arrayName, index)
                            }
                            disabled={problem[arrayName].length === 1}
                            className="text-red-600 disabled:opacity-40"
                        >
                            Remove
                        </button>
                    </div>

                    <label className="block">
                        <span className="text-sm font-medium">
                            Input
                        </span>
                        <textarea
                            required
                            value={testcase.input}
                            onChange={(e) =>
                                updateArrayField(
                                    arrayName,
                                    index,
                                    "input",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded border border-base-300 bg-base-100 p-2 text-base-content"
                            rows={3}
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium">
                            Expected Output
                        </span>
                        <textarea
                            required
                            value={testcase.output}
                            onChange={(e) =>
                                updateArrayField(
                                    arrayName,
                                    index,
                                    "output",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded border border-base-300 bg-base-100 p-2 text-base-content"
                            rows={2}
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium">
                            Explanation (optional)
                        </span>
                        <textarea
                            value={testcase.experience ?? ""}
                            onChange={(e) =>
                                updateArrayField(
                                    arrayName,
                                    index,
                                    "experience",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded border border-base-300 bg-base-100 p-2 text-base-content"
                            rows={2}
                        />
                    </label>
                </div>
            ))}

            <button
                type="button"
                onClick={() => addItem(arrayName)}
                className="rounded-lg border px-4 py-2"
            >
                + Add Test Case
            </button>
        </section>
    );

    return (
        <>
        {/* Navbar */}
      <nav className="navbar border-b border-base-300 bg-base-100 px-6 shadow-sm">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-primary">ApexX Admin</h1>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("/admin/dashboard")}
        >
          Back to dashboard
        </button>
      </nav>
        <main className="mx-auto max-w-4xl space-y-6 p-6">
            <h1 className="text-3xl font-bold">
                Update Problem
            </h1>

            {/* STEP 1: Search */}
            <form
                onSubmit={handleSearch}
                className="space-y-3 rounded-xl border p-5"
            >
                <label className="block font-medium">
                    Search by Problem ID
                </label>

                <input
                    required
                    value={problemId}
                    onChange={(e) =>
                        setProblemId(e.target.value)
                    }
                    placeholder="Enter MongoDB problem ID"
                    className="w-full rounded-lg border p-3"
                />

                <button
                    type="submit"
                    disabled={loading || !problemId.trim()}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
                >
                    {loading ? "Searching..." : "Search Problem"}
                </button>
            </form>

            {message && (
                <p className="rounded-lg bg-green-50 p-3 text-green-800">
                    {message}
                </p>
            )}

            {error && (
                <pre className="whitespace-pre-wrap rounded-lg bg-red-50 p-3 text-red-700">
                    {error}
                </pre>
            )}

            {/* STEP 2: Editable form appears after search */}
            {isLoaded && (
                <form
                    onSubmit={handleUpdate}
                    className="space-y-6"
                >
                    <section className="space-y-4 rounded-xl border p-5">
                        <h2 className="text-xl font-semibold">
                            Basic Details
                        </h2>

                        <label className="block">
                            <span className="font-medium">
                                Title
                            </span>
                            <input
                                required
                                value={problem.title}
                                onChange={(e) =>
                                    updateField("title", e.target.value)
                                }
                                className="mt-1 w-full rounded border p-2"
                            />
                        </label>

                        <label className="block">
                            <span className="font-medium">
                                Description
                            </span>
                            <textarea
                                required
                                rows={5}
                                value={problem.discription}
                                onChange={(e) =>
                                    updateField(
                                        "discription",
                                        e.target.value
                                    )
                                }
                                className="mt-1 w-full rounded border p-2"
                            />
                        </label>

                        <label className="block">
                            <span className="font-medium">Tag</span>
                            <input
                                required
                                value={problem.tag}
                                onChange={(e) =>
                                    updateField("tag", e.target.value)
                                }
                                className="mt-1 w-full rounded border p-2"
                            />
                        </label>

                        <label className="block">
                            <span className="font-medium">
                                Difficulty
                            </span>
                            <select
                                value={problem.difficulty}
                                onChange={(e) =>
                                    updateField(
                                        "difficulty",
                                        e.target.value
                                    )
                                }
                                className="mt-1 w-full rounded border p-2"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </label>
                    </section>

                    {renderTestCases(
                        "visible_testcases",
                        "Visible Test Cases"
                    )}

                    {renderTestCases(
                        "hidden_testcases",
                        "Hidden Test Cases"
                    )}

                    {/* Starter code entries */}
                    <section className="space-y-4 rounded-xl border p-4">
                        <h2 className="text-xl font-semibold">
                            Starting Code
                        </h2>

                        {problem.start_code.map((item, index) => (
                            <div
                                key={`start-${index}`}
                                className="space-y-3 rounded-lg bg-base-200 p-4 text-base-content"
                            >
                                <div className="flex justify-between">
                                    <h3>Starter Code {index + 1}</h3>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeItem("start_code", index)
                                        }
                                        disabled={
                                            problem.start_code.length === 1
                                        }
                                        className="text-red-600 disabled:opacity-40"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <label className="block">
                                    Language
                                    <select
                                        value={item.language}
                                        onChange={(e) =>
                                            updateArrayField(
                                                "start_code",
                                                index,
                                                "language",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 w-full rounded border border-base-300 bg-base-100 p-2 text-base-content"
                                    >
                                        <option value="javascript">
                                            JavaScript
                                        </option>
                                        <option value="cpp">C++</option>
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                    </select>
                                </label>

                                <label className="block">
                                    Code
                                    <textarea
                                        required
                                        rows={8}
                                        value={item.code}
                                        onChange={(e) =>
                                            updateArrayField(
                                                "start_code",
                                                index,
                                                "code",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 w-full rounded border border-base-300 bg-base-100 p-2 font-mono text-base-content"
                                    />
                                </label>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => addItem("start_code")}
                            className="rounded-lg border px-4 py-2"
                        >
                            + Add Starter Code
                        </button>
                    </section>

                    {/* Reference solutions */}
                    <section className="space-y-4 rounded-xl border p-4">
                        <h2 className="text-xl font-semibold">
                            Reference Solutions
                        </h2>

                        {problem.ref_solution.map((item, index) => (
                            <div
                                key={`solution-${index}`}
                                className="space-y-3 rounded-lg bg-base-200 p-4 text-base-content"
                            >
                                <div className="flex justify-between">
                                    <h3>Solution {index + 1}</h3>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeItem("ref_solution", index)
                                        }
                                        disabled={
                                            problem.ref_solution.length === 1
                                        }
                                        className="text-red-600 disabled:opacity-40"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <label className="block">
                                    Language
                                    <select
                                        value={item.language}
                                        onChange={(e) =>
                                            updateArrayField(
                                                "ref_solution",
                                                index,
                                                "language",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 w-full rounded border border-base-300 bg-base-100 p-2 text-base-content"
                                    >
                                        <option value="javascript">
                                            JavaScript
                                        </option>
                                        <option value="cpp">C++</option>
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                    </select>
                                </label>

                                <label className="block">
                                    Complete Solution
                                    <textarea
                                        required
                                        rows={10}
                                        value={item.complete_code}
                                        onChange={(e) =>
                                            updateArrayField(
                                                "ref_solution",
                                                index,
                                                "complete_code",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 w-full rounded border border-base-300 bg-base-100 p-2 font-mono text-base-content"
                                    />
                                </label>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => addItem("ref_solution")}
                            className="rounded-lg border px-4 py-2"
                        >
                            + Add Reference Solution
                        </button>
                    </section>

                    <button
                        type="submit"
                        disabled={updating}
                        className="w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                    >
                        {updating
                            ? "Validating and Updating..."
                            : "Update Problem"}
                    </button>
                    
                    {message && (
                <p className="rounded-lg bg-green-50 p-3 text-green-800">
                    {message}
                </p>
            )}

            {error && (
                <pre className="whitespace-pre-wrap rounded-lg bg-red-50 p-3 text-red-700">
                    {error}
                </pre>
            )}
                </form>
            )}
        </main>
        </>
    );
            }
