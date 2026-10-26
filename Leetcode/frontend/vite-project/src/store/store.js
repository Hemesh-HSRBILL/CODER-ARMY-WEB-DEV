import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/authSlice";
import editorReducer from "../slice/editorSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        editor: editorReducer,
    }
})

export default store 