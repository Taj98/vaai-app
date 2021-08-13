import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { UserService } from '../services/user-service'

export const ProfileRequests = {
    getProfile: createAsyncThunk(
        'getProfile',
        async () => {
            const profile = await UserService.profile()
            
            if (!profile) {
                throw "User not logged in"
            }

            return profile
        }
    ),
    editProfile: createAsyncThunk(
        'createProfile',
        async payload => {
            await UserService.updateProfile(payload)
            

            return payload
        }
    )
}

const profile = createSlice({
    name: 'profile',
    initialState: {
        profile: null,
        loading: false,
        error: null
    },
    reducers: {
        setProfilePic: (state, {payload}) => {
            state.profile.profilePicture = payload
        },
        setDriversLicensePic: (state, {payload}) => {
            state.profile.licensePicture = payload
        },
        setProfile: (state, {payload}) => {
            state.profile = payload
        }
    },
    extraReducers: {
        [ProfileRequests.getProfile.pending]: state => {
            state.loading = true
            state.error = null
        },
        [ProfileRequests.getProfile.fulfilled]: (state, {payload}) => {
            console.log('No error thrown')
            state.loading = false
            state.profile = payload
        },
        [ProfileRequests.getProfile.rejected]: (state, {error}) => {
            console.log('Error thrown')
            state.loading = false
            state.error = error
        },
        [ProfileRequests.editProfile.pending]: state => {
            state.loading = true
            state.error= null
        },
        [ProfileRequests.editProfile.fulfilled]: (state, {payload}) => {
            state.loading = false
            state.profile = payload
        },
        [ProfileRequests.editProfile.rejected]: (state, {error}) => {
            state.loading = false
            state.error = error
        }
    }
})

export const { setProfilePic, setDriversLicensePic, setProfile } = profile.actions
export default profile.reducer