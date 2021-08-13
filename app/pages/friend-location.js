import React, { useState, useEffect, useCallback } from 'react'
import { Container, View, Switch, Item, Input, Button, Text, List, ListItem, Content, Spinner } from "native-base"
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps"
import { RoadsideService } from '../services/roadside-service'
import { Share } from 'react-native'

export const FriendLocationPage = ({navigation}) => {
    const [locationId, setLocationId] = useState(null)
    const [linkSent, setLinkSent] = useState(false)
    const [friendLocation, setFriendLocation] = useState(null)
    const callback = navigation.getParam('callback')

    useEffect(() => {
        RoadsideService.newLocationRequest().then(id => {
            console.log("ID:" + id)
            setLocationId(id)
        })        
    }, [])

    useEffect(() => {
        if (locationId) {
            RoadsideService.listenForFriendLocation(locationId).subscribe(location => {
                setFriendLocation(location)
            })
        }
    }, [locationId])

    const onShareLink = () => {
        Share.share({
            message: `Share your location by clicking on the link so you can receive roadside assistance. https://vaai-location.web.app/${locationId}`
        })
    }

    return (
        <Container style={{flex: 1, flexDirection: 'row'}}>
            {friendLocation && <MapView provider={PROVIDER_GOOGLE} style={{flex: 1}} 
            region={{
                latitude: friendLocation.lat,
                longitude: friendLocation.lng,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            }} >

        <Marker coordinate={{
            latitude: friendLocation.lat,
            longitude: friendLocation.lng
        }} />

       </MapView>}

       {friendLocation && <View style={{padding: 10, position: 'absolute', left: 0, bottom: 0, right: 0}}>
            <Button onPress={() => {
                callback(friendLocation)

                navigation.goBack()
            }} block>
                <Text style={{color: 'white'}}>Confirm</Text>
            </Button>
       </View>}

        
       {!friendLocation && (
            <View style={{flex: 1}}>
            {!linkSent && (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{textAlign: 'center', marginBottom: 10}}>Share the link with your friend to receive their location.</Text>
                    <Button onPress={onShareLink} style={{backgroundColor: 'black'}}>
                        <Text>Share Link</Text>
                    </Button>

                    <Text style={{marginTop: 40}}>Waiting for your friend to confirm their location</Text>
                </View>
            )}

            {linkSent && (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{textAlign: 'center', marginBottom: 10}}>Waiting for your friend to confirm their location</Text>
                    <Spinner />
                </View>
            )}
       </View>)}
       
        </Container>
    )
}

FriendLocationPage.navigationOptions = ({navigation}) => {
    const {state} = navigation

    return {
        title: 'Location'
    }
}