import update from 'immutability-helper';
import { ACTION_ADD_DEVICE, ACTION_ATTEMPT_CONNECT_DEVICE_SUCCESS, ACTION_ATTEMPT_CONNECT_DEVICE_FAILED, ACTION_ATTEMPT_CONNECT_DEVICE, ACTION_DEVICE_DISCONNECTED, ACTION_PAIRED_WITH_OBD, ACTION_PAIRED_WITH_OBD_FAILED } from './obd-device-action';

const obdDevice = (state = {
    connected: false,
    paired: false,
    deviceId: null,
    connectedAt: null,
    device: null,
    connecting: false
}, action) => {
    switch (action.type) {
        case ACTION_ATTEMPT_CONNECT_DEVICE:
            return update(state, {
                connected: {
                    $set: false
                },
                connecting: {
                    $set: true
                },
                device: {
                    $set: null
                }
            })
        case ACTION_ATTEMPT_CONNECT_DEVICE_SUCCESS:
            return update(state, {
                connected: {
                    $set: true
                },
                connectedAt: {
                    $set: new Date()
                },
                device: {
                    $set: action.device
                },
                connecting: {
                    $set: false
                }
            })
        case ACTION_ATTEMPT_CONNECT_DEVICE_FAILED:
            return update(state, {
                connected: {
                    $set: false
                },
                device: {
                    $set: null
                },
                connecting: {
                    $set: false
                }
            })
        case ACTION_ADD_DEVICE:
            return update(state, {
                deviceId: {
                    $set: action.deviceId
                }
            })
        case ACTION_DEVICE_DISCONNECTED:
            return update(state, {
                connected: {
                    $set: false
                },
                device: {
                    $set: false
                }
            })
        case ACTION_PAIRED_WITH_OBD:
            return update(state, {
                paired: {
                    $set: true
                },
                device: {
                    $set: false
                }
            })
        case ACTION_PAIRED_WITH_OBD_FAILED:
            return update(state, {
                paired: {
                    $set: false
                },
                device: {
                    $set: null
                }
            })
        default:
            return state
    }
}

export default obdDevice