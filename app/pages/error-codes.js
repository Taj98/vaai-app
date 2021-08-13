import React, { useEffect, useState } from 'react'
import { Container, List, ListItem, Body, Text, Content, View, Spinner, Button } from "native-base"
import { CustomHeader } from '../components/custom-header'
import { VaaiColors } from '../theme'
import { VaaiBackground } from '../components/vaai-background'
import { useBluetoothStatus, BluetoothStatus } from 'react-native-bluetooth-status';
import { BleManager } from 'react-native-ble-plx'
import { connect } from 'react-redux'
import { requestConnectDevice } from '../redux/obd-device/obd-device-action'
import { OBDConnectionService } from '../services/obd-service'
import { Alert } from 'react-native'
import App from '../../App'

const ErrorCodesPage = ({navigation, requestConnectDevice, obdDevice}) => {
    // const manager = new BleManager()
    // const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(null)
    // const [btStatus, isPending, setBluetooth] = useBluetoothStatus()
    // const [devices, setDevices] = useState({})
    // const [connecting, setConnecting] = useState(false)
    let resettedBluetooth = false
    let startedResetting = false
    const [loading, setLoading] = useState(false)
    
    // useEffect(() => {
    //     BluetoothStatus.state().then(enabled => {
    //         // if (enabled == true && resettedBluetooth == false) {
    //         //     startedResetting = true
    //         //     setBluetooth(false)
    //         // } else if (enabled == false && resettedBluetooth == false && startedResetting) {
    //         //     resettedBluetooth = true
    //         //     setBluetooth(true)
    //         // }
    //         if (enabled) {
    //             startScanning() 
    //         }
    //         setIsBluetoothEnabled(enabled)
    //     })
    // }, [])

    // useEffect(() => {
    //     if (btStatus != null) {
    //         // setIsBluetoothEnabled(btStatus)
    //     }

    //     if (btStatus === true) {
    //         requestConnectDevice()
    //         // startScanning()
    //     }
    // }, [btStatus])

    const enableBluetooth = () => {
        console.log(obdDevice.deviceId)
        navigation.navigate('AddDevice')
        // requestConnectDevice(obdDevice.deviceId)
        // setBluetooth(true)
    }

    // const startScanning = () => {
    //     console.log('Starting to scan')
    //     manager.startDeviceScan(null, null, (err, device) => {
    //         if (!err) {
    //             console.log('Found device')
    //           // console.log(device)
    //           devices[device.id] = device
    //           const target = {}
    //           Object.assign(target, devices)
    //           setDevices(target)
    //         } else {
    //             console.log('Count not scan')
    //         //   console.log(err)
    //         }
    //       })
    // }

    // const connect = device => {
    //     manager.connectToDevice(device.id).then(connectedDevice => {
    //         return connectedDevice.discoverAllServicesAndCharacteristics().then(() => {
    //             connectedDevice.monitorCharacteristicForService('18F0', '2AF0', (err, characteristic) => {
    //                 if (!err) { 
    //                     const value = base64.decode(characteristic.value)
    //                     console.log(value + " = " + characteristic.value)
    //                 }
    //             })
    //         })
    //     })
    // }

    const runDiagnostic = () => {
        console.log('Connecting')
        setLoading(true)
        OBDConnectionService.connect().then(() => {
            console.log('Connected')
            Alert.alert('Connected', result)
            return OBDConnectionService.sendToObd('01 01').then(result => {
                Alert.alert('Success', result)
                console.log(result)

                return OBDConnectionService.sendToObd('03').then(result => {
                    console.log(result)
                    Alert.alert('Success', result)
                })
            })
        }).catch(err => {
            Alert.alert('Error', err)
        }).finally(() => {
            setLoading(false)
        })
    }

    return (
        <Container style={{backgroundColor: VaaiColors.blue}}>
            <VaaiBackground showTop={false} />
            {obdDevice.paired && 
                <View style={{alignItems: 'center', justifyContent: 'center', position: 'absolute',
                    left: 0, right: 0, top: 0, bottom: 0, padding: 20}}>
                    {!loading && <Text style={{textAlign: 'center', color: 'white', margin: 20}}>Your data logger has been paired. Make sure your vehicle is on before running the diagnostic</Text>}
                    {!loading && <Button small bordered rounded light onPress={runDiagnostic}>
                        <Text>Run Diagnostic</Text>
                    </Button>}
                    {loading && <Spinner color='white' />}
                    {/* <Text style={{color: 'white', textAlign: 'center'}}>No errors found, everything seems to be good</Text> */}
                </View>
            }

            {obdDevice.paired === false && <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{textAlign: 'center', color: 'white', margin: 20}}>You need to enable bluetooth on your phone &amp; plug the data logger into your vehicles KANBUS port to get your vehicles health.</Text>
                    <Button small bordered rounded light onPress={enableBluetooth}>
                        <Text>Connect to data logger</Text>
                    </Button>
            </View>}

            {/* {isBluetoothEnabled == null && <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Spinner color='white' />
            </View>} */}
        </Container>
    )
}

const statesToProps = states => {
    return {
        obdDevice: states.obdDevice,
        profile: states.profile.profile
    }
}

const dispatchToProps = dispatch => {
    return {
        removeProfile: () => dispatch(setProfile(null)),
        requestConnectDevice: deviceId => dispatch(requestConnectDevice(deviceId))
    }
}

ErrorCodesPage.navigationOptions = ({navigation}) => {
    return {
        title: 'Vehicle Check Up',
        header: <CustomHeader
            title='Vehicle Check Up'
            backgroundColor={VaaiColors.blue}
            headerNextToBack={true} 
            navigation={navigation}
        />
    }
}

export default connect(statesToProps, dispatchToProps)(ErrorCodesPage)