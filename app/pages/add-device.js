import React, { useState, useEffect } from 'react'
import { BleManager } from 'react-native-ble-plx'
import { useBluetoothStatus, BluetoothStatus } from 'react-native-bluetooth-status'
import { Container, Content, List, ListItem, Body, Text, Spinner, View, Button } from 'native-base'
import { VaaiBackground } from '../components/vaai-background'
import { VaaiColors } from '../theme'
import { CustomHeader } from '../components/custom-header'
import { requestConnectDevice } from '../redux/obd-device/obd-device-action'
import { connect } from 'react-redux'
import OBDService from '../obd-service';
import { NativeEventEmitter, NativeModules } from 'react-native';

const DeviceItem = ({device, requestConnectDevice}) => {
    const connectToDevice = () => {
        requestConnectDevice(device.id)
    }

    return (
        <ListItem onPress={connectToDevice} button key={device.id} style={{marginLeft: 10, marginRight: 10, borderBottomColor: 'white'}}>
            <Body>
                <Text style={{color: 'white'}}>
                    {device.name ? device.name : device.id}
                </Text>
            </Body>
        </ListItem>
    )
}

const AddDevicePage = ({
    requestConnectDevice,
    obdDevice
}) => {
    const manager = new BleManager()
    const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(null)
    const [btStatus, isPending, setBluetooth] = useBluetoothStatus()
    const [devices, setDevices] = useState({})
    const [searching, setSearching] = useState(false)

    const eventEmitter = new NativeEventEmitter(OBDService);

    useEffect(() => {
        BluetoothStatus.state().then(enabled => {
            // if (enabled == true && resettedBluetooth == false) {
            //     startedResetting = true
            //     setBluetooth(false)
            // } else if (enabled == false && resettedBluetooth == false && startedResetting) {
            //     resettedBluetooth = true
            //     setBluetooth(true)
            // }
            if (enabled) {
                startScanning() 
            }
            setIsBluetoothEnabled(enabled)
        })
    }, [])

    useEffect(() => {
        if (btStatus != null) {
            setIsBluetoothEnabled(btStatus)
        }

        if (btStatus === true) {
            startScanning()
        }
    }, [btStatus])

    const enableBluetooth = () => {
        setBluetooth(true)
    }

    const startScanning = () => {
        console.log('Starting to scan')
        setSearching(true)
        
        eventEmitter.addListener('bluetoothDeviceFound', device => {
            if (device.name && (device.name.toLowerCase().indexOf('vlink') != -1 || device.name.toLowerCase().indexOf('v-link') != -1)) {
                devices[device.id] = device
                const target = {}
                Object.assign(target, devices)
                setDevices(target)
            }
         });
        OBDService.discoverDevices()

        // manager.startDeviceScan(null, null, (err, device) => {
        //     if (!err) {
        //         console.log('Found device')
        //       // console.log(device)
        //     //   if (device.name && (device.name.toLowerCase().indexOf('vlink') != -1 || device.name.toLowerCase().indexOf('v-link') != -1)) {
        //         devices[device.id] = device
        //         const target = {}
        //         Object.assign(target, devices)
        //         setDevices(target)
        //     //   }
              
        //     } else {
        //         console.log('Count not scan')
        //     //   console.log(err)
        //     }
        //   })
    }
    
    return (
        <Container style={{backgroundColor: VaaiColors.blue}}>
            <VaaiBackground showTop={false} />
            {isBluetoothEnabled && Object.keys(devices).length > 0 && <Content style={{marginBottom: 70}}>
                <Text style={{
                    textAlign: 'center',
                    color: 'white',
                    margin: 20
                }}>Select your device below</Text>
                <List style={{backgroundColor: VaaiColors.purple, marginLeft: 30,
                    marginRight: 30, marginTop: 30}}>
                    {Object.keys(devices).map(deviceId => {
                        const device = devices[deviceId]
                        return <DeviceItem requestConnectDevice={requestConnectDevice} key={device.id} device={device} />
                    })}
                </List>
            </Content>}

            {isBluetoothEnabled === false && <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{textAlign: 'center', color: 'white', margin: 20}}>You need to enable bluetooth to view error codes</Text>
                    <Button small bordered rounded light onPress={enableBluetooth}>
                        <Text>Enable Bluetooth</Text>
                    </Button>
            </View>}

            {isBluetoothEnabled == null && <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Spinner color='white' />
            </View>}

            {searching && Object.keys(devices).length == 0 && <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Spinner color='white' />
                <Text style={{textAlign: 'center', color: 'white', margin: 20}}>Searching for devices near you</Text>
            </View>}
        </Container>
    )
}

AddDevicePage.navigationOptions = ({navigation}) => {
    return {
        title: 'Add Device',
        header: <CustomHeader
            title='Add Device'
            backgroundColor={VaaiColors.blue}
            headerNextToBack={true} 
            navigation={navigation}
        />
    }
}

const stateToProps = state => {
    return {
        obdDevice: state.obdDevice
    }
}

const dispatchToProps = dispatch => {
    return {
        requestConnectDevice: deviceId => dispatch(requestConnectDevice(deviceId))
    }
}

export default connect(stateToProps, dispatchToProps)(AddDevicePage)