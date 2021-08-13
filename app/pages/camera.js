import React, { useState } from 'react'
import { Container, View, Icon } from "native-base"
import { RNCamera } from 'react-native-camera';
import { TouchableOpacity } from 'react-native';

export const CameraPage = ({navigation}) => {
    const { goBack, getParam } = navigation
    const [cameraType, setCameraType] = useState(RNCamera.Constants.Type.back)
    let camera
    const callback = getParam('callback')

    const switchCamera = () => {
        if (cameraType == RNCamera.Constants.Type.back) {
            setCameraType(RNCamera.Constants.Type.front)
        } else {
            setCameraType(RNCamera.Constants.Type.back)
        }
    }

    return (
        <Container style={{flex: 1, flexDirection: 'row'}}>
            <RNCamera
                ref={ref => {
                    camera = ref;
                }}
                type={cameraType}
                style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }}
                
                autoFocus='on'
                androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                  }}
                  androidRecordAudioPermissionOptions={{
                    title: 'Permission to use audio recording',
                    message: 'We need your permission to use your audio',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                  }}
            />

            <View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                padding: 20,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <TouchableOpacity onPress={async () => {
                    if (camera) {
                        const options = { quality: 0.5, base64: false };
                        const data = await camera.takePictureAsync(options);
                        // console.log(data.uri);

                        callback(data)
                        goBack()
                    }
                }}>
                    <View style={{borderRadius: 50, width: 50, height: 50, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon name='camera' style={{color: 'black'}} />
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={switchCamera} style={{
                position: 'absolute',
                bottom: 20,
                right: 20
            }}>
                <View style={{borderRadius: 50, width: 50, height: 50, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}}>
                    <Icon name='refresh' style={{color: 'black'}} />
                </View>
            </TouchableOpacity>
        </Container>
    )
}