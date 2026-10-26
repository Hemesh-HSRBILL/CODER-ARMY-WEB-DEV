const Submit = require("../models/submit");
const Problem = require("../models/problem_Schema");
const {
  getLanguageById,
  encodeBase64,
  decodeBase64,
  submitBatch,
  submitToken,
} = require("../utils/problem_utility");

const submit_problem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    // jab code submit hoga in leetcode you code and language goes as req (tojudge0 or Db)

    const { code, language } = req.body;
    if (!problemId || !code || !language) {
      return res.status(400).send("field missing");
    }

    const normalizedLanguage = language.toLowerCase() === "cpp" ? "c++" : language;
    const languageId = getLanguageById(normalizedLanguage);

    //    Fetch the problem from database
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    if (!Array.isArray(problem.hidden_testcases) || problem.hidden_testcases.length === 0) {
      return res.status(400).json({ message: "This problem has no hidden test cases" });
    }
    //    testcases(Hidden)

    //    apne submit store kar du pehle....

    const submitedResult = await Submit.create({
      userId,
      problemId,
      code,
      language: normalizedLanguage,
      status: "pending",
      testCasesTotal: problem.hidden_testcases.length,
    });

    //    Judge0 code ko submit karna hai

    const submissions = problem.hidden_testcases.map((testcase) => ({
      source_code: encodeBase64(code),
      language_id: languageId,
      stdin: encodeBase64(testcase.input),
      expected_output: encodeBase64(testcase.output),
      base64_encoded: true,
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    // submittedResult ko update karo

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status?.id == 3 || test.status_id == 3) {
        testCasesPassed++;
        const testRuntime = Number.parseFloat(test.time);
        const testMemory = Number(test.memory);
        if (Number.isFinite(testRuntime)) runtime += testRuntime;
        if (Number.isFinite(testMemory)) memory = Math.max(memory, testMemory);
      } else {
        if (test.status?.id == 4 || test.status_id == 4) {
          status = "error";
          errorMessage = decodeBase64(test.stderr) || decodeBase64(test.compile_output);
        } else {
          status = "wrong";
          errorMessage = decodeBase64(test.stderr) || decodeBase64(test.compile_output);
        }
      }
    }
    // Store the result in Database in Submission
    submitedResult.status = status;
    submitedResult.runtime = runtime;
    submitedResult.memory = memory;
    submitedResult.errorMessage = errorMessage || "";
    submitedResult.testCasesPassed = testCasesPassed;

    await submitedResult.save();

    //Send data to problem solved so we now which problem user solved
    if (
      status === "accepted" &&
      !(Array.isArray(req.result.problemSolved) ? req.result.problemSolved : [])
        .some((solvedId) => String(solvedId) === String(problemId))
    ) {
      if (!Array.isArray(req.result.problemSolved)) req.result.problemSolved = [];
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    res.status(201).json({ message: "Submitted successfully", result: submitedResult });
  } catch (error) {
    res.status(500).send("Internal Server Error " + error.message);
  }
};

const runCode = async (req, res) => {
  //
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    const { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    //    Fetch the problem from database
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    if (!Array.isArray(problem.visible_testcases) || problem.visible_testcases.length === 0) {
      return res.status(400).json({ message: "This problem has no visible test cases" });
    }

    //    Judge0 code ko submit karna hai
    const normalizedLanguage = language.toLowerCase() === "cpp" ? "c++" : language;
    const languageId = getLanguageById(normalizedLanguage);

   
    const submissions = problem.visible_testcases.map((testcase) => ({
      source_code: encodeBase64(code),
      language_id: languageId,
      stdin: encodeBase64(testcase.input),
      expected_output: encodeBase64(testcase.output),
      base64_encoded: true,
    }));

    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);

    res.status(201).send(testResult);
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};
module.exports = { submit_problem, runCode };
