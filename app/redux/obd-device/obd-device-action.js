import { BleManager } from "react-native-ble-plx"
import AsyncStorage from '@react-native-community/async-storage';
import OBDService from '../../obd-service';

export const ACTION_ADD_DEVICE = 'ADD_DEVICE'
export const ACTION_ATTEMPT_CONNECT_DEVICE = 'CONNECT_DEVICE'
export const ACTION_ATTEMPT_CONNECT_DEVICE_FAILED = 'CONNECT_DEVICE_FAILED'
export const ACTION_ATTEMPT_CONNECT_DEVICE_SUCCESS = 'CONNECT_DEVICE_SUCCESS'
export const ACTION_DISCONNECT_DEVICE = 'DISCONNECT_DEVICE'
export const ACTION_REMOVE_DEVICE = 'REMOVE_DEVICE'
export const ACTION_DEVICE_DISCONNECTED = 'DEVICE_DISCONNECTED'
export const ACTION_OBD_RESPONSE = 'OBD_RESPONSE'
export const ACTION_SEND_COMMAND_TO_OBD = 'SEND_COMMAND_TO_OBD'
export const ACTION_PAIRED_WITH_OBD = 'ACTION_PAIRED_WITH_OBD'
export const ACTION_PAIRED_WITH_OBD_FAILED = 'ACTION_PAIRED_WITH_OBD_FAILED'

export const obdResponse = response => {
    return {
        type: ACTION_OBD_RESPONSE,
        response
    }
}

export const addDevice = deviceId => {
    return {
        type: ACTION_ADD_DEVICE,
        deviceId
    }
}

export const connectDevice = deviceId => {
    return {
        type: ACTION_ATTEMPT_CONNECT_DEVICE,
        deviceId
    }
}

export const pairedWithDeviceSuccess = device => {
    return {
        type: ACTION_PAIRED_WITH_OBD,
        device
    }
}

export const pairedWithDeviceFailed = device => {
    return {
        type: ACTION_PAIRED_WITH_OBD_FAILED,
        device
    }
}

export const connectDeviceSuccess = device => {
    return {
        type: ACTION_ATTEMPT_CONNECT_DEVICE_SUCCESS,
        device
    }
}

export const connectDeviceFailed = (deviceId, error) => {
    return {
        type: ACTION_ATTEMPT_CONNECT_DEVICE_FAILED,
        deviceId,
        error
    }
}

export const deviceDisconnected = deviceId => {
    return {
        type: ACTION_DEVICE_DISCONNECTED,
        deviceId
    }
}

export const requestConnectDevice = deviceId => {
    return dispatch => {
        dispatch(addDevice(deviceId))

        OBDService.pairToOBD(deviceId, err => {
            dispatch(pairedWithDeviceFailed(deviceId, err))
        }, device => {
            dispatch(pairedWithDeviceSuccess(device))
        })

        // const manager = new BleManager()
        // manager.connectToDevice(deviceId).then(device => {
        //     console.log('Connected')
        //     return device.discoverAllServicesAndCharacteristics().then(() => {
        //         console.log('Discoving services')
        //         dispatch(connectDeviceSuccess(device))

        //         device.onDisconnected(() => {
        //             dispatch(deviceDisconnected(deviceId))
        //         })
        //         // manager.onDeviceDisconnected(connectedDeviceId => {
        //         //     // if (connectedDeviceId == deviceId) {
        //         //         dispatch(deviceDisconnected(connectedDeviceId))
        //         //     // }
        //         // })
        //         AsyncStorage.setItem('obdDeviceId', device.id)
        //       device.monitorCharacteristicForService('18F0', '2AF0', (err, characteristic) => {
        //         if (!err) {
        //             const value = base64.decode(characteristic.value) 
        //             switch (value) {
        //                 case '41 0D': // speed
        //                     break
        //                 case '41 0C':
        //                     break // speed
        //             }
        //         }
        //         // if (!err) {
        //         //   const value = base64.decode(characteristic.value)
        //         //   console.log(value + " = " + characteristic.value)
        //         //   if (value.indexOf('41 0D') == 0) { // speed
        //         //     this.foundResult = true
        //         //     console.log('Found speed')
        //         //     const speed = parseInt("0x"+value.split(' ')[2])
        //         //     this.setState({
        //         //       speed: speed
        //         //     })
        //         //   } else if (value.indexOf('41 0C') == 0) { // rpm
        //         //     this.foundResult = true
        //         //     console.log('Found rpm')
        //         //     const values = value.split(' ')
        //         //     console.log("0x" + values[2] + values[3])
        //         //     const rpm = parseInt("0x" + values[2] + values[3]) / 4
        //         //     this.setState({
        //         //       rpm: rpm
        //         //     })
        //         //   }
        //         // }
        //       })
        //     })
        //   }).catch(err => {
              
        //     manager.cancelDeviceConnection(deviceId).then(() => {
        //       console.log('Connection cancelled')
        //     }).catch(err => {
        //         dispatch(connectDeviceFailed(deviceId, err))
        //     })
        //     dispatch(connectDeviceFailed(deviceId, err))
        //   })
    }
}