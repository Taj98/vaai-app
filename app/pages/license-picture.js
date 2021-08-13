import React, { useState } from 'react'
import { Container, View, Button, Text } from 'native-base'
import { Image, Alert } from 'react-native'
import App from '../../App'
import { UserService } from '../services/user-service'
import { StackActions, NavigationActions } from 'react-navigation'

export const LicensePicturePage = ({navigation}) => {
    const {navigate} = navigation
    const [profileLink, setProfileLink] = useState(null)

    const capturePicture = () => {
        navigate('Camera', {
            callback: (picture) => {
                setProfileLink(picture.uri)
            }
        })
    }

    const upload = () => {
        App.showLoading("Uploading Driver's Lisence Picture")
        UserService.updateLicensePicture(profileLink).then(() => {
            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'App' })],
              });
              navigation.dispatch(resetAction);
        }).catch(err => {
            Alert.alert('Error', err.message)
        }).finally(() => {
            App.stopLoading()
        })
    }

    return (
        <Container>
            <View style={{padding: 20}}>
                <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 24}}>Driver's License</Text>
                <Text style={{textAlign: 'center', fontSize: 18}}>
                    Final Step. Please take a picture of the front of your driver's license
                </Text>
            </View>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <View style={{borderRadius: 130, borderColor: 'black', borderWidth: 3, padding: 5}}>
                    <Image style={{width: 200, height: 200, borderRadius: 130}}
                    source={profileLink ? {uri: profileLink} : require('../assets/imgs/avatar.png')} />
                </View>
                
            </View>
            <View style={{padding: 10}}>
                {!profileLink && <Button dark block style={{marginBottom: 10}} onPress={capturePicture}>
                    <Text>Capture Picture</Text>
                </Button>}
                {profileLink && <Button dark bordered block style={{marginBottom: 10}} onPress={capturePicture}>
                    <Text>Recapture Picture</Text>
                </Button>}
                {profileLink && <Button block dark onPress={upload}>
                    <Text>Continue</Text>
                </Button>}
            </View>
        </Container>
    )
}

LicensePicturePage.navigationOptions = {
    title: 'License Picture'
}