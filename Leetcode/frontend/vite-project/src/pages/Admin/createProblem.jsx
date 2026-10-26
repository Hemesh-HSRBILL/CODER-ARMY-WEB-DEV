import { useState } from "react";
import { useNavigate } from "react-router";
import { axiosClient } from "../../utils/axios";

// One empty test case

const createTestCase = () => ({
  input: "",
  output: "",
  experience: "",
});

// Initial form values

const createInitialProblem = () => ({
  title: "",
  discription: "",
  difficulty: "",
  tag: "",

  visible_testcases: [createTestCase()],
  hidden_testcases: [createTestCase()],

  start_code: [
    {
      language: "JavaScript",
      code: "",
    },
  ],

  ref_solution: [
    {
      language: "JavaScript",
      complete_code: "",
    },
  ],
});

// Language values must match your getLanguageById helper.

const languages = [
  { value: "C++", label: "C++" },
  { value: "Java", label: "Java" },
  { value: "JavaScript", label: "JavaScript" },
  { value: "Python", label: "Python" },
];

export default function CreateProblem() {
  const navigate = useNavigate();

  const [problem, setProblem] = useState(createInitialProblem());
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Update title, description, difficulty, tag, etc.

  const updateField = (field, value) => {
    setProblem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update an individual field inside an array.

  //Parameters

  //arrayName → the key in your state object that holds an array (e.g. "testcases").

  //index → which element in that array you want to update.

  //field → the property of that element to update (e.g. "input").

  //value → the new value to assign.

  const updateArrayField = (arrayName, index, field, value) => {
    setProblem((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => {
        return i === index ? { ...item, [field]: value } : item;
      }),
    }));
  };

  // Add a new test case, language, or reference solution.

  const addArrayItem = (arrayName, newitem) => {
    setProblem((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { ...newitem }],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setProblem((prev) => {
      if (prev[arrayName].length <= 1) {
        return prev;
      }

      return {
        ...prev,
        [arrayName]: prev[arrayName].filter((_, i) => i !== index),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!problem.difficulty) {
      setStatus({
        type: "error",
        message: "Please select a difficulty.",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await axiosClient.post("/problem/create", problem);

      setStatus({
        type: "success",
        message: response.data?.message || "Problem created successfully!",
      });
      // Clear the form after a successful save.
      setProblem(createInitialProblem());
    } catch (error) {
      const data = error.response?.data;

      setStatus({
        type: "error",
        message:
          data?.message ||
          data?.error ||
          (typeof data === "string" ? data : null) ||
          error.message ||
          "Failed to create problem.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-base-200">
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

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Problem Management
          </p>

          <h1 className="mt-2 text-3xl font-bold">Create New Problem</h1>

          <p className="mt-2 text-base-content/70">
            Add the problem statement, test cases, starter code, and verified
            reference solutions.
          </p>
        </div>

        {/* Success or error message */}
        {status && (
          <div
            role="status"
            className={`alert mb-6 ${
              status.type === "success" ? "alert-success" : "alert-error"
            }`}
          >
            <span>{status.message}</span>
          </div>
        )}
      </section>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Basic problem details */}
        <section className="card bg-base-100 shadow-sm px-1">
          <div className="card-body">
            <h1 className="card-title">Basic Details</h1>
          </div>

          <div className="space-y-4 px-6">
            <label className="form-control w-full">
              <span className="label-text mb-2">Problem Title</span>

              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. Two Sum"
                value={problem.title}
                onChange={(e) => {
                  updateField("title", e.target.value);
                }}
                required
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text mb-2">Description</span>

              <textarea
                className="textarea textarea-bordered min-h-36 w-full"
                placeholder="Describe the problem statement..."
                value={problem.discription}
                onChange={(e) => {
                  updateField("discription", e.target.value);
                }}
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-control w-full">
                <span className="label-text mb-2">Difficulty</span>

                <select
                  className="select select-bordered w-full"
                  value={problem.difficulty}
                  onChange={(e) => updateField("difficulty", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select difficulty
                  </option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>

              <label htmlFor="">
                <span>Tag</span>

                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="e.g. Array"
                  value={problem.tag}
                  onChange={(e) => updateField("tag", e.target.value)}
                  required
                />
              </label>
            </div>
          </div>
        </section>

        {/* 2. Visible test cases */}
        <section className="card bg-base-100 shadow-sm px-1">
          <div className="card-body" px-6>
            <div>
              <h2 className="card-title">2. Visible Test Cases</h2>

              <p className="pt-2 text-sm text-base-content/60">These cases can be shown to users.</p>
            </div>

            {problem.visible_testcases.map((testcase, index) => (
              <div
                key={`visible-${index}`}
                className="mt-4 space-y-3 rounded-xl border border-base-300 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Test Case {index + 1}</h3>

                  {problem.visible_testcases.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-error btn-outline btn-sm"
                      onClick={() => {
                        removeArrayItem("visible_testcases", index);
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <label className="form-control">
                  <span className="label-text mb-2">input</span>

                  <textarea
                    placeholder={"Example:\n2 7"}
                    className="textarea textarea-bordered w-full font-mono"
                    value={testcase.input}
                    onChange={(e) =>
                      updateArrayField(
                        "visible_testcases",
                        index,
                        "input",
                        e.target.value,
                      )
                    }
                    required
                  ></textarea>
                </label>

                <label className="form-control">
                  <span className="label-text mb-2">Expected_Output</span>

                  <textarea
                    className="textarea textarea-bordered w-full font-mono"
                    placeholder={"Example:\n9"}
                    value={testcase.output}
                    onChange={(e) =>
                      updateArrayField(
                        "visible_testcases",
                        index,
                        "output",
                        e.target.value,
                      )
                    }
                    required
                  ></textarea>
                </label>

                <label className="form-control">
                  <span className="label-text mb-2">
                    Explanation (optional)
                  </span>

                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Explain this test case..."
                    value={testcase.experience}
                    onChange={(e) =>
                      updateArrayField(
                        "visible_testcases",
                        index,
                        "experience",
                        e.target.value,
                      )
                    }
                  />
                </label>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline btn-primary mt-4"
              onClick={() =>
                addArrayItem("visible_testcases", createTestCase())
              }
            >
              <span className="text-xl">+</span>
              Add Visible Test Case
            </button>
          </div>
        </section>

        {/* 3. Hidden test cases */}

        <section className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div>
              <h2 className="card-title">3. Hidden Test Cases</h2>
              <p className="text-sm text-base-content/60 pt-2">
                These cases should be used for judging submissions without
                exposing them to users.
              </p>
            </div>

            {problem.hidden_testcases.map((testcase, index) => (
              <div
                key={`hidden-${index}`}
                className="mt-4 space-y-3 rounded-xl border border-base-300 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Hidden Case {index + 1}</h3>

                  {problem.hidden_testcases.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-error btn-outline btn-sm"
                      onClick={() => removeArrayItem("hidden_testcases", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <label className="form-control">
                  <span className="label-text mb-2">Input</span>

                  <textarea
                    className="textarea textarea-bordered w-full font-mono"
                    placeholder="Hidden test input"
                    value={testcase.input}
                    onChange={(e) =>
                      updateArrayField(
                        "hidden_testcases",
                        index,
                        "input",
                        e.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label className="form-control">
                  <span className="label-text mb-2">Expected Output</span>

                  <textarea
                    className="textarea textarea-bordered w-full font-mono"
                    placeholder="Expected output"
                    value={testcase.output}
                    onChange={(e) =>
                      updateArrayField(
                        "hidden_testcases",
                        index,
                        "output",
                        e.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label className="form-control">
                  <span className="label-text mb-2">
                    Explanation (optional)
                  </span>

                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Explain this test case..."
                    value={testcase.experience}
                    onChange={(e) =>
                      updateArrayField(
                        "hidden_testcases",
                        index,
                        "experience",
                        e.target.value,
                      )
                    }
                  />
                </label>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-outline btn-primary mt-4"
              onClick={() => addArrayItem("hidden_testcases", createTestCase())}
            >
              <span className="text-xl">+</span>
              Add Hidden Test Case
            </button>
          </div>
        </section>

        {/* 4. Starting code */}

        <section className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div>
              <h2 className="card-title">4. Starting Code</h2>
              <p className="text-sm text-base-content/60 pt-2">
                Starter code displayed when users open the problem in a
                language.
              </p>
            </div>

            {problem.start_code.map((item, index) => (
              <div
                key={`starter-${index}`}
                className="mt-4 space-y-3 rounded-xl border border-base-300 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Starter Language {index + 1}
                  </h3>

                  {problem.start_code.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-error btn-outline btn-sm"
                      onClick={() => removeArrayItem("start_code", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <label className="form-control">
                  <span className="label-text mb-2">Language</span>

                  <select
                    className="select select-bordered w-full"
                    value={item.language}
                    onChange={(e) =>
                      updateArrayField(
                        "start_code",
                        index,
                        "language",
                        e.target.value,
                      )
                    }
                    required
                  >
                    {languages.map((language) => (
                      <option key={language.value} value={language.value}>
                        {language.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-control">
                  <span className="label-text mb-2">Starter Code</span>

                  <textarea
                    className="textarea textarea-bordered min-h-48 w-full font-mono"
                    placeholder="// Write starter code..."
                    value={item.code}
                    onChange={(e) =>
                      updateArrayField(
                        "start_code",
                        index,
                        "code",
                        e.target.value,
                      )
                    }
                    required
                  />
                </label>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-outline btn-primary mt-4"
              onClick={() =>
                addArrayItem("start_code", {
                  language: "JavaScript",
                  code: "",
                })
              }
            >
              <span className="text-xl">+</span>
              Add Starting Code Language
            </button>
          </div>
        </section>

        {/* 5. Reference solutions */}

        <section className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div>
              <h2 className="card-title">5. Reference Solutions</h2>
              <p className="text-sm text-base-content/60 pt-2">
                Provide the complete correct solution for each supported
                language.
              </p>
            </div>

            {problem.ref_solution.map((item, index) => (
              <div
                key={`solution-${index}`}
                className="mt-4 space-y-3 rounded-xl border border-base-300 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Reference Solution {index + 1}
                  </h3>

                  {problem.ref_solution.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-error btn-outline btn-sm"
                      onClick={() => removeArrayItem("ref_solution", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <label className="form-control">
                  <span className="label-text mb-2">Language</span>

                  <select
                    className="select select-bordered w-full"
                    value={item.language}
                    onChange={(e) =>
                      updateArrayField(
                        "ref_solution",
                        index,
                        "language",
                        e.target.value,
                      )
                    }
                    required
                  >
                    {languages.map((language) => (
                      <option key={language.value} value={language.value}>
                        {language.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-control">
                  <span className="label-text mb-2">
                    Complete Solution Code
                  </span>

                  <textarea
                    className="textarea textarea-bordered min-h-64 w-full font-mono"
                    placeholder="// Write the complete correct solution..."
                    value={item.complete_code}
                    onChange={(e) =>
                      updateArrayField(
                        "ref_solution",
                        index,
                        "complete_code",
                        e.target.value,
                      )
                    }
                    required
                  />
                </label>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-outline btn-primary mt-4"
              onClick={() =>
                addArrayItem("ref_solution", {
                  language: "JavaScript",
                  complete_code: "",
                })
              }
            >
              <span className="text-xl">+</span>
              Add Reference Solution
            </button>
          </div>
        </section>

        <div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate("/admin/dashboard")}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary sm:min-w-48"
            disabled={loading}
          >
            {loading ? "Checking solutions..." : "Create Problem"}
          </button>
        </div>
      </form>
    </main>
  );
}
