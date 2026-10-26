const Problem = require("../models/problem_Schema");
const SolutionVideo = require("../models/SolutionVideo");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const Submit = require("../models/submit");
const User = require("../models/user");
const { findById, findByIdAndUpdate } = require("../models/user");
const {
  getLanguageById,
  encodeBase64,
  decodeBase64,
  submitBatch,
  submitToken,
} = require("../utils/problem_utility");
const axios = require("axios");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const problem_create = async (req, res) => {
  const {
    title,
    discription,
    tag,
    difficulty,
    visible_testcases,
    hidden_testcases,
    start_code,
    ref_solution,
    problem_creator,
  } = req.body;

  try {
    // Validate problem data if required
    //    validate_problem(req.body);

    // STEP 1
    // Check every reference solution

    for (let { language, complete_code } of ref_solution) {
      // Get Judge0 language ID
      const languageId = getLanguageById(language);

      // STEP 2
      // Create submissions for visible test cases

      const submissions = visible_testcases.map((element) => ({
        // Judge0 expects Base64
        source_code: encodeBase64(complete_code),
        language_id: languageId,
        // Judge0 expects Base64
        stdin: encodeBase64(element.input),
        // Judge0 expects Base64
        expected_output: encodeBase64(element.output),
      }));

      //console.log only check result coming or not
      console.log("submissions :", submissions);

      const submitResult = await submitBatch(submissions);

      //console.log only check result coming or not
      console.log("result of submissions :", submitResult);

      // STEP 4
      // Extract tokens
      const resultToken = submitResult.map((value) => {
        return value.token;
      });

      console.log("Tokens:", resultToken);

      // STEP 5
      // Send tokens AGAIN to Judge0

      const testResult = await submitToken(resultToken);
      console.log("testResult :", testResult);

      for (let test of testResult) {
        if (test.status.id !== 3) {
          //decode ouput if have and show error

          const output = decodeBase64(test.stdout);
          const error = decodeBase64(test.stderr);
          const compileOutput = decodeBase64(test.compile_output);

          return res.status(500).json({
            message: `Reference solution failed for ${language}`,

            status: test.status,

            output: output,

            error: error,

            compile_output: compileOutput,
          });
        }
      }
      console.log("All visible test cases passed for:", language);
    }
    // STEP 7
    // ALL REFERENCE SOLUTIONS PASSED
    console.log("All reference solutions passed.");

    // STEP 8
    // Save Problem in MongoDB

    const userProblem = await Problem.create({
      ...req.body,

      problem_creator: req.result._id,
    });

    // STEP 9
    // Send Success Response

    res
      .status(201)
      .json({ message: "Problem saved successfully", problem: userProblem });
  } catch (error) {
    console.log("Create Problem Error:");
    return res.status(400).json({
      message: error.message || "Unable to create problem.",
    });
  }
};

const problem_update = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    discription,
    tag,
    difficulty,
    visible_testcases,
    hidden_testcases,
    start_code,
    ref_solution,
    problem_creator,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid problem ID",
    });
  }

  try {
    if (!id) {
      return res.status(400).send("no id field");
    }
    console.log(id);

    const problem = await Problem.findById(id);
    console.log(problem);

    if (!problem) {
      return res.status(400).send("not problem exist ");
    }

    // This form submits all fields, so validate required arrays.
    if (
      !Array.isArray(visible_testcases) ||
      visible_testcases.length === 0 ||
      !Array.isArray(ref_solution) ||
      ref_solution.length === 0
    ) {
      return res.status(400).json({
        message:
          "At least one visible test case and reference solution are required",
      });
    }

    //same check for ref_solution before update saved in db by judge0

    for (let { language, complete_code } of ref_solution) {
      const languageId = getLanguageById(language);

      const submissions = visible_testcases.map((element) => ({
        // Judge0 expects Base64
        source_code: encodeBase64(complete_code),
        language_id: languageId,
        // Judge0 expects Base64
        stdin: encodeBase64(element.input),
        // Judge0 expects Base64
        expected_output: encodeBase64(element.output),
      }));

      const submitResult = await submitBatch(submissions);

      const resultToken = submitResult.map((value) => value.token);

      const testResult = await submitToken(resultToken);

      for (let test of testResult) {
        if (test.status.id !== 3) {
          //decode ouput if have and show error

          const output = decodeBase64(test.stdout);
          const error = decodeBase64(test.stderr);
          const compileOutput = decodeBase64(test.compile_output);

          return res.status(500).json({
            message: `Reference solution failed for ${language}`,

            status: test.status,

            output: output,

            error: error,

            compile_output: compileOutput,
          });
        }
      }
      console.log("All visible test cases passed for:", language);
    }
    // STEP 7
    // ALL REFERENCE SOLUTIONS PASSED
    console.log("All reference solutions passed.");

    const new_problem = await Problem.findByIdAndUpdate(
      id,
      { ...req.body },
      { runValidators: true, new: true },
    );

    res
      .status(200)
      .json({ message: "Problem updated successfully", problem: new_problem });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Problem update failed",
      error: error.message,
    });
  }
};

const problem_delete = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid problem ID",
    });
  }

  if (!id) {
    return res.status(400).send("ID not found");
  }

  try {
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        message: "Problem does not exist",
      });
    }

    const problem_deleted = await Problem.findByIdAndDelete(id);
    const linkedVideo = await SolutionVideo.findOneAndDelete({ problemId: id });

    if (linkedVideo) {
      try {
        await cloudinary.uploader.destroy(linkedVideo.cloudinaryPublicId, {
          resource_type: "video",
          invalidate: true,
        });
      } catch (videoError) {
        console.error("Problem deleted, but linked video cleanup failed:", videoError);
      }
    }

    return res.status(200).json({
      message: "Problem deleted successfully",
      deletedProblem: problem_deleted,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error occurred while deleting problem",
      error: error.message,
    });
  }
};

const problem_getById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send("ID not found");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid problem ID",
    });
  }

  try {
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).send("Problem does not exist");
    }

    const videos = await SolutionVideo.findOne({ problemId: id });

    if (videos) {
      const responseData = {
        ...problem.toObject(),
        secureUrl: videos.secureUrl,
        thumbnailUrl: videos.thumbnailUrl,
        duration: videos.duration,
      };

      return res.status(200).send(responseData);
    }

    res.status(200).send(problem);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

const getAll_problem = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const AllProblem = await Problem.find({})
      .skip(skip)
      .limit(limit)
      .select("title discription difficulty tag visible_testcases start_code ");
    console.log(AllProblem);

    if (AllProblem.length === 0) {
      return res.status(404).json({ message: "No problems found in DB" });
    }

    res.status(200).json({
      message: "Fetched problems successfully",
      getAllProblem: AllProblem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error occurred while fetching problems",
      error: error.message,
    });
  }
};

const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    const ans = await Submit.find({ userId, problemId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ submissions: ans });
  } catch (err) {
    return res.status(500).json({
      message: "Unable to fetch submissions",
      error: err.message,
    });
  }
};

const solved_problem_user = async (req, res) => {
  const userId = req.result._id;
  try {
    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "title discription tag",
    });
    res.status(200).send(user.problemSolved);
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

module.exports = {
  problem_create,
  problem_update,
  problem_delete,
  problem_getById,
  getAll_problem,
  submittedProblem,
  solved_problem_user,
};
