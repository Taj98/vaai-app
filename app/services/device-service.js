import { getUniqueId, getBrand, getBuildNumber, getBundleId, getModel, getDeviceId, getVersion } from "react-native-device-info"

export const DeviceService = {
    deviceInfo: async () => {
        return {
            deviceId: getUniqueId(),
            brand: getBrand(),
            buildNumber: getBuildNumber(),
            bundleId: getBundleId(),
            model: getModel(),
            device: getDeviceId(),
            appVersion: getVersion()
        }
    }
}