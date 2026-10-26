
import { useState } from "react";
import { axiosClient } from "../../utils/axios";

export default function DeleteProblem() {
    const [problemId, setProblemId] = useState("");
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // STEP 1: Search problem by ID
    const handleSearch = async (e) => {
        e.preventDefault();

        setLoading(true);
        setProblem(null);
        setMessage("");
        setError("");

        try {
            const response = await axiosClient.get(
                `/problem/problem_getById/${problemId.trim()}`
            );

            const foundProblem =
                response.data?.getProblemById ||
                response.data?.problem ||
                response.data;

            if (!foundProblem?._id) {
                throw new Error("Problem data was not returned by the server.");
            }

            setProblem(foundProblem);
            setMessage("Problem found. Verify the details before deleting.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Problem not found. Please check the ID."
            );
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Confirm and delete
    const handleDelete = async () => {

        {/* window.confirm() method — it’s part of the Web API available in browsers.
            window.confirm() shows a modal dialog box with a message and two buttons: OK and Cancel.

             If the user clicks OK, it returns true.
 
             If the user clicks Cancel, it returns false. */}

        const confirmed = window.confirm(
            `Are you sure you want to permanently delete "${problem.title}"?\n\nThis action cannot be undone.`
        );

        // Stop if the admin clicks Cancel.
        if (!confirmed) {
            return;
        }

        setDeleting(true);
        setError("");
        setMessage("");

        try {
            const response = await axiosClient.post(
                `/problem/delete/${problem._id}`
            );

            setMessage(
                response.data?.message ||
                "Problem deleted successfully."
            );

            // Remove the deleted problem from the screen.
            setProblem(null);
            setProblemId("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to delete the problem."
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <main className="mx-auto max-w-3xl space-y-6 p-6">
            <h1 className="text-3xl font-bold text-red-600">
                Delete Problem
            </h1>

            {/* STEP 1: Search */}
            <form
                onSubmit={handleSearch}
                className="space-y-4 rounded-xl border p-5"
            >
                <label className="block font-medium">
                    Enter Problem ID
                </label>

                <input
                    required
                    value={problemId}
                    onChange={(e) => setProblemId(e.target.value)}
                    placeholder="Enter MongoDB problem ID"
                    className="w-full rounded-lg border p-3"
                />

                <button
                    type="submit"
                    disabled={loading || !problemId.trim() || deleting}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
                >
                    {loading ? "Searching..." : "Search Problem"}
                </button>
            </form>

            {/* Status messages */}
            {message && (
                <p className="rounded-lg bg-green-50 p-3 text-green-800">
                    {message}
                </p>
            )}

            {error && (
                <p className="rounded-lg bg-red-50 p-3 text-red-700">
                    {error}
                </p>
            )}

            {/* STEP 2: Display the found problem */}
            {problem && (
                <section className="space-y-4 rounded-xl border border-red-200 p-5">
                    <h2 className="text-xl font-semibold">
                        Confirm Problem Details
                    </h2>

                    <div>
                        <p className="text-sm text-gray-500">
                            Problem ID
                        </p>
                        <p className="break-all font-mono">
                            {problem._id}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Title</p>
                        <p className="font-semibold">{problem.title}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Description
                        </p>
                        <p className="whitespace-pre-wrap">
                            {problem.discription}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <span className="rounded-full bg-base-100 px-3 py-1">
                            Difficulty: {problem.difficulty}
                        </span>

                        <span className="rounded-full bg-base-100 px-3 py-1">
                            Tag: {problem.tag}
                        </span>
                    </div>

                    <p className="text-sm text-red-600">
                        Warning: deleting this problem cannot be undone.
                    </p>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                    >
                        {deleting ? "Deleting..." : "Delete Problem"}
                    </button>
                </section>
            )}
        </main>
    );
}
