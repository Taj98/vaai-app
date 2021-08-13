import React, { useEffect, useState } from 'react'
import { View, Button, Icon, Text } from 'native-base'
import { Image, TouchableOpacity } from 'react-native'
import { VaaiBackground } from './vaai-background'
import { VaaiColors } from '../theme'

export const ProfileHeader = ({navigation, backgroundColor = VaaiColors.blue, title, subtitle, image, tintColor = 'white', headerRight}) => {
    const { navigate } = navigation
    const [profileImage, setProfileImage] = useState(image)
    
    useEffect(() => {
        setProfileImage(image)
    }, [image])

    const profilePictureUpdated = (url) => {
        setProfileImage(url)
    }

    const updateProfile = () => {
        navigate('UpdateProfilePicture', {
            fromProfile: true,
            callback: profilePictureUpdated
        })
    }

    return (
        <View style={{backgroundColor: backgroundColor}}>
            <VaaiBackground showBottom={false} />
            <View style={{marginLeft: 40, marginRight: 40, marginTop: 30}}>
                <View style={{flexDirection: 'row'}}>
                    <Button transparent onPress={() => {
                        navigation.goBack()
                    }}>
                        <Icon style={{color: tintColor}} name='arrow-back' />
                    </Button>
                    <View style={{flex: 1}} />
                    {headerRight}
                </View>
                <View style={{flexDirection: 'row', marginBottom: 20, alignItems: 'center'}}>
                    <View style={{flex: 1}}>
                        <Text style={{fontWeight: 'bold', fontSize: 24, color: tintColor, marginTop: 20}}>{title}</Text>
                        <Text style={{color: 'white', marginBottom: 20}}>{subtitle}</Text>
                    </View>
                    <TouchableOpacity onPress={updateProfile}>
                        <View style={{backgroundColor: '#dfdfdf', padding: 3, borderRadius: 50}}>
                            <Image resizeMode='cover' style={{width: 50, height: 50, borderRadius: 50}} source={{uri: profileImage}} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}