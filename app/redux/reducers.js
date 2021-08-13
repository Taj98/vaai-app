import { combineReducers } from "redux";
import obdDeviceReducer from './obd-device/obd-device-reducer'
import profile from './profile'

export default combineReducers({
    obdDevice: obdDeviceReducer,
    profile: profile
})