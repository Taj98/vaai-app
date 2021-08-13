import React, { useState, useEffect } from 'react'
import { Container, View, Button, Icon } from "native-base"
import { RNCamera } from 'react-native-camera';
import { PermissionsAndroid } from 'react-native';

export const ScanLicenseDiskPage = ({navigation}) => {
    const { goBack, getParam } = navigation
    const [cameraType, setCameraType] = useState(RNCamera.Constants.Type.back)
    const [torchMode, setTorchMode] = useState(RNCamera.Constants.FlashMode.off)
    const [hasStorage, setHasStorage] = useState(false)
    let scanned = false
    const callback = getParam('callback')

    useEffect(() => {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then(hasStorage => {
            setHasStorage(hasStorage)
        })
    }, [])

    const barcodeReceived = (event) => {
        console.log(event)
        // for (let i = 0; i < events.length; i++) {
            // console.log(event)
            if (scanned == false && event.type === 'PDF_417') {
                scanned = true
                let array = event.data.split('%')
                let licenseDisk = {
                    licensePlate: array[6],
                    color: array[11],
                    make: array[9],
                    model: array[10],
                    engine: array[13],
                    vin: array[12],
                    registerNumber: array[7],
                    licenseDiskExp: array[14]
                }

                callback(licenseDisk)
                goBack()
                
            }
        // }    
    }

    const toggleFlash = () => {
        // setTorchMode(RNCamera.Constants.FlashMode.on)
        if (torchMode == RNCamera.Constants.FlashMode.off) {
            setTorchMode(RNCamera.Constants.FlashMode.torch)
        } else {
            setTorchMode(RNCamera.Constants.FlashMode.off)
        }
    }

    const switchCamera = () => {
        if (cameraType == RNCamera.Constants.Type.back) {
            setCameraType(RNCamera.Constants.Type.front)
        } else {
            setCameraType(RNCamera.Constants.Type.back)
        }
    }

    return (
        <Container style={{flex: 1, flexDirection: 'row'}}>
            {hasStorage && <RNCamera
                barCodeTypes={[RNCamera.Constants.BarCodeType.pdf417]}
                autoFocus={true}
                style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }}
                type={cameraType}
                flashMode={torchMode}
                onBarCodeRead={barcodeReceived}
                androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera to scan the license disk',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                }}
                androidRecordAudioPermissionOptions={{
                    title: 'Permission to use audio recording',
                    message: 'We need your permission to use your audio',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                }}
                // torchMode={this.state.torchOn ? Camera.constants.TorchMode.on : Camera.constants.TorchMode.off}
                // onGoogleVisionBarcodesDetected={({ barcodes }) => {
                //     barcodeReceived(barcodes)
                // // console.log(barcodes);
                // }}
                // ref={cam => this.camera = cam}
                // aspect={Camera.constants.Aspect.fill}
            />}
            <View style={{flexDirection: 'row', flexWrap: 'wrap', position: 'absolute', right: 20, bottom: 20}}>
                <Button onPress={toggleFlash} style={{backgroundColor: 'white', alignItems: 'center', justifyContent: 'center',  marginRight: 10}}><Icon style={{color: 'black'}} name="flash"></Icon></Button>
                <Button onPress={switchCamera} style={{backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}}><Icon style={{color: 'black'}} name="refresh"></Icon></Button>
            </View>
        </Container>
    )
}