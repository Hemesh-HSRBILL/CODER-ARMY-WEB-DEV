import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from "../utils/axios"

export const registerUser = createAsyncThunk(
    'auth/register',
    async(userdata,{rejectWithValue})=>{
        try{
            const response = await axiosClient.post('/user/register',userdata) // means call at /user/register'and send userdata to server
        return response.data.user || response.data
        }
        catch(error){
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

export const loginUser = createAsyncThunk(
    'auth/login',
    async(creadential,{rejectWithValue})=>{
        try{
            const response = await axiosClient.post('/user/login',creadential)
        return response.data.user || response.data
        }
        catch(error){
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

export const checkAuth = createAsyncThunk(
    'auth/check',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/user/check');
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            return null; // direct return because we know logout has no response
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

const authSlice = createSlice({
    name:'auth',
    initialState:{
        user:null,
        loading:false,
        isAuthenticated: false,
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        // Register User Cases
        .addCase(registerUser.pending , (state)=>{
            state.loading=true,
            state.error=null
        })
        .addCase(registerUser.fulfilled , (state , action)=>{
            state.loading=false,
           /* !action.payload → negates the value once.
            If action.payload is truthy (like a non‑empty object, array, string, number ≠ 0), then !action.payload becomes false.
            If action.payload is falsy (null, undefined, 0, "", false), then !action.payload becomes true
            !!action.payload → negates again.
            If action.payload was truthy → !!action.payload = true.If action.payload was falsy → !!action.payload = false.
            check all edge case if there null retrn the false if object true */
            state.isAuthenticated=!!action.payload
            state.error=null,
            state.user=action.payload
        })
        .addCase(registerUser.rejected , (state,action)=>{
            state.loading=false,
            state.isAuthenticated=false,
            state.error=action.payload?.message || 'Something went wrong'
            state.user=null
        })

        // Login User Cases
        .addCase(loginUser.pending,(state)=>{
            state.loading=true,
            state.error=null
        })
        .addCase(loginUser.fulfilled,(state,action)=>{
            state.loading=false,
            state.error=null,
            state.isAuthenticated=!!action.payload,
            state.user=action.payload;
        })
        .addCase(loginUser.rejected,(state,action)=>{
            state.loading=false,
            state.error=action.payload?.message || 'Something went wrong',
            state.user=null,
            state.isAuthenticated=false
        })

        // Check Auth Cases
              .addCase(checkAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
              })
              .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = !!action.payload;
                state.user = action.payload;
              })
              .addCase(checkAuth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                state.isAuthenticated = false;
                state.user = null;
              })
          
              // Logout User Cases
              .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
              })
              .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
              })
              .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                state.isAuthenticated = false;
                state.user = null;
              });
    }
})

export default authSlice.reducer