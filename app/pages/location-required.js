import { Container, View, Text, Icon, Button } from "native-base"
import React, { useEffect } from 'react'
import AsyncStorage from '@react-native-community/async-storage';
import { LocationService } from "../services/location-service"
import { UserService } from "../services/user-service"

export const LocationRequiredPage = ({navigation}) => {
    const { navigate } = navigation

    useEffect(() => {
        AsyncStorage.setItem('@askedLocation', 'true')
    }, [])

    return (
        <Container>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Icon name='pin' style={{fontSize: 58}} />
                <Text style={{fontSize: 20, marginTop: 20, marginBottom: 10, fontWeight: 'bold'}}>Enable Location</Text>
                <Text style={{textAlign: 'center', marginLeft: 40, marginRight: 40}}>Please enable your location to get the most out of Vaai</Text>
            </View>

            <View style={{padding: 10}}>
                <Button block dark style={{marginBottom: 10}} onPress={() => {
                    LocationService.requestPermissions().then(() => {
                        AsyncStorage.setItem('@askedLocation', 'true')

                        UserService.uid().then(uid => {

                        
                        UserService.profile(uid).then(profile => {
                            if (profile && profile.registrationLocation == null) {
                                LocationService.getCurrentPosition().then(location => {
                                    UserService.updateRegistrationLocation({
                                        lat: location.coords.latitude,
                                        lng: location.coords.longitude
                                    })
                                })
                            }
                        })
                    })
                        
                        navigate('Home')
                    }).catch(err => {
                        Alert.alert('Error', err.message, [{
                            text: 'Location Settings',
                            onPress: () => {
                                OpenAppSettings.open()
                            }
                        }, {
                            text: 'Cancel'
                        }])
                    })
                    
                }}>
                    <Text>Enable Location</Text>
                </Button>

                <Button block dark bordered onPress={() => {
                    AsyncStorage.setItem('@askedLocation', 'true')
                    navigate('Home')
                }}>
                    <Text>Never Mind</Text>
                </Button>
            </View>
        </Container>
    )
}