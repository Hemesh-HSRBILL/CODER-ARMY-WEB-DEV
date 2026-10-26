import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  codeByProblem: {},
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    initializeCode(state, action) {
      const { problemId, language, code } = action.payload;
      if (!problemId || !language || typeof code !== "string") return;

      const problemCode = state.codeByProblem[problemId] || {};
      if (typeof problemCode[language] !== "string") {
        state.codeByProblem[problemId] = {
          ...problemCode,
          [language]: code,
        };
      }
    },
    setCode(state, action) {
      const { problemId, language, code } = action.payload;
      if (!problemId || !language || typeof code !== "string") return;

      state.codeByProblem[problemId] = {
        ...(state.codeByProblem[problemId] || {}),
        [language]: code,
      };
    },
    resetCode(state, action) {
      const { problemId, language, code } = action.payload;
      if (!problemId || !language || typeof code !== "string") return;

      state.codeByProblem[problemId] = {
        ...(state.codeByProblem[problemId] || {}),
        [language]: code,
      };
    },
  },
});

export const { initializeCode, setCode, resetCode } = editorSlice.actions;
export default editorSlice.reducer;
