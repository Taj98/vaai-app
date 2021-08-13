import OBDService from '../obd-service';
import base64 from 'react-native-base64'

export const CURRENT_DATA = '01'
export const FREEZE_FRAME_DATA = '02'
export const STORED_DIAGNOSTIC_CODES = '03'
export const PENDING_DIAGNOSTIC_CODES = '07'
export const VEHICLE_INFORMATION = '09'
export const SYSTEM = 'AT'

export const OBDServices = {
    system: {
        init: 'SP 0'
    },
    currentData: {
        vehicleSpeed: '0D',
        engineRPM: '0C',
        engineCoolantTemp: '05',
        fuelPressure: '0A'
    },
    vehicleInformation: {
        vinNumber: '02'
    },
    faultCodes: {
        scanVehicle: '01 01\r',
        getFaultCodes: '03\r'
    }
}

export const OBDConnectionService = {
    connect: () => {
        return new Promise((resolve, reject) => {
            OBDService.connectToObd(err => reject(err), () => resolve())
        })
    },
    disconnect: () => {
        OBDService.disconnectFromObd()
    },
    sendToObd: data => {
        return new Promise((resolve, reject) => {
            const base64Data = base64.encode(data + '\r')
            console.log(base64Data)
            OBDService.sendToObd(base64Data, err => reject(err), result => resolve(result))
        })
    }
}