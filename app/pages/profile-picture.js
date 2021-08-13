import React, { useState } from 'react'
import { Container, View, Button, Text } from 'native-base'
import { Image, Alert } from 'react-native'
import App from '../../App'
import { UserService } from '../services/user-service'
import { setProfilePic, setDriversLicensePic } from '../redux/profile'
import { connect } from 'react-redux'

const ProfilePicturePage = ({navigation, setProfilePic}) => {
    const { navigate, getParam, goBack } = navigation
    const [profileLink, setProfileLink] = useState(null)
    const fromProfilePage = getParam('fromProfile')
    const callback = getParam('callback')

    const capturePicture = () => {
        navigate('Camera', {
            callback: (picture) => {
                console.log(picture.uri)
                setProfileLink(picture.uri)
            }
        })
    }

    const upload = () => {
        console.log('Uploading')
        App.showLoading("Uploading Profile Picture")
        UserService.updateProfilePicture(profileLink).then(url => {
            setProfilePic(profileLink)
            console.log(url)

            if (fromProfilePage) {
                goBack()
            } else {
                navigate('LicensePicture')
            }
        }).catch(err => {
            Alert.alert('Error', err.message)
        }).finally(() => {
            App.stopLoading()
        })
    }

    return (
        <Container>
            <View style={{padding: 20}}>
                <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 24}}>Selfie</Text>
                <Text style={{textAlign: 'center', fontSize: 18}}>
                    We are almost done. Please take a selfie
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

ProfilePicturePage.navigationOptions = {
    title: 'Profile Picture'
}

const dispatchToProps = dispatch => {
    return {
        setProfilePic: profilePic => dispatch(setProfilePic(profilePic)),
        setDriversLicensePic: pic => dispatch(setDriversLicensePic(pic))
    }
}

export default connect(null, dispatchToProps)(ProfilePicturePage)