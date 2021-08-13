import React, { useState, useEffect, useCallback } from 'react'
import { Container, View, Switch, Item, Input, Button, Text, List, ListItem, Content } from "native-base"
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps"
import Geolocation from 'react-native-geolocation-service';
import { debounce } from 'lodash'
import DelayInput from "react-native-debounce-input";
import { LocationService } from '../services/location-service';
import { ScrollView } from 'react-native-gesture-handler';

export const TopRight = ({findMe, onFindMeChange}) => {
    // const [findMe, setFindMe] = useState(true)

    return (
        <View style={{flexDirection: 'row'}}>
            <Text style={{color: 'white'}}>Find Me</Text>
            <Switch value={findMe} onValueChange={(value) => onFindMeChange(value)} />
        </View>
    )
}

export const LocationPage = ({navigation}) => {
    // const [zoomLevel, setZoomLevel] = useState(11)
    const [findMe, setFindMe] = useState(true)
    const [address, setAddress] = useState({text: '', search: false})
    const [addresses, setAddresses] = useState([])
    const [location, setLocation] = useState(null)
    const [addressLocation, setAddressLocation] = useState(null)
    const [currentLocation, setCurrentLocation] = useState(null)
    const [watchId, setWatchId] = useState(null)
    const callback = navigation.getParam('callback')

    const onFindMeChanged = (findMe) => {
        setFindMe(findMe)
    }

    useEffect(() => {
        if (address && address.search) {
            LocationService.addresses(address.text).then(addresses => {
                setAddresses(addresses)
            })
        } else {
            console.log(address)
        }
    }, [address])

    // useEffect(() => {
    //     setLocation(null)
    //     if (findMe) {
    //         const watchId = Geolocation.getCurrentPosition(location => {
    //             setLocation({
    //                 lat: location.coords.latitude,
    //                 lng: location.coords.longitude
    //             })
    //             setCurrentLocation({
    //                 lat: location.coords.latitude,
    //                 lng: location.coords.longitude
    //             })
    //         }, (err) => {}, {
    //             distanceFilter: 0,
    //             enableHighAccuracy: true,
    //             maximumAge: 0,
    //             forceRequestLocation: true
    //         })

    //         setWatchId(watchId)
    //     }
    // }, [findMe])

    useEffect(() => {
        navigation.setParams({findMe: true, findMeChanged: onFindMeChanged})
        const watchId = Geolocation.watchPosition(location => {

            if (findMe) {
                setLocation({
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                })

                setCurrentLocation({
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                })
            }
        }, err => {}, {
            maximumAge: 0,
            enableHighAccuracy: true,
            distanceFilter: 50,
            forceRequestLocation: true
        })
        setWatchId(watchId)

        return () => {
            console.log('Stop listening to location')
            Geolocation.clearWatch(watchId)
            Geolocation.stopObserving()
        }
    }, [findMe])

    let locationToRender = findMe ? location : addressLocation

    if (locationToRender == null) {
        locationToRender = currentLocation
    }

    return (
        <Container style={{flex: 1, flexDirection: 'row'}}>
            <MapView onPress={event => {
                setFindMe(false)
                setAddressLocation({
                    lat: event.nativeEvent.coordinate.latitude,
                    lng: event.nativeEvent.coordinate.longitude
                })
                console.log(event.nativeEvent.coordinate)
            }} provider={PROVIDER_GOOGLE} style={{flex: 1}} 
            region={locationToRender ? {
                latitude: locationToRender.lat,
                longitude: locationToRender.lng,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            } : {
                latitude: 27,
                longitude: -28,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            }} >

        {location && <Marker coordinate={{
            latitude: location.lat,
            longitude: location.lng
        }} />}

        {addressLocation && <Marker coordinate={{
            latitude: addressLocation.lat,
            longitude: addressLocation.lng
        }} />}

       </MapView>

       <View style={{padding: 10, position: 'absolute', left: 0, top: 0, right: 0, bottom: 0}}>
            <Item regular style={{backgroundColor: 'white'}}>
                <DelayInput delayTimeout={1000} value={address.text} onChangeText={text => {
                    setFindMe(false)
                    setAddress({text: text, search: true})
                    navigation.setParams({findMe: false})
                    // if (!findMe) {
                        
                    // }
                }} disabled={findMe} placeholder='Type Address' autoCapitalize='words' style={{
                    color: findMe ? '#dfdfdf' : '#000000'
                }} placeholderTextColor={findMe ? '#dfdfdf' : '#a0a0a0'} />
            </Item>

            {addresses.length > 0 && <ScrollView contentContainerStyle={{
                    backgroundColor: 'white',
                    marginTop: 10
                }}>
                    <List>
                        {addresses.map((address, index) => {
                            return (
                                <ListItem key={index} button onPress={() => {
                                    setAddress({text: address.description, search: false})
                                    setAddresses([])
                                    LocationService.geocode(address.description).then(location => {
                                        console.log(location)
                                        setAddressLocation(location.location)
                                    })
                                }}>
                                    <Text>{address.description}</Text>
                                </ListItem>
                            )
                        })}
                    </List>
                </ScrollView>}
            {/* </Content> */}
       </View>

       <View style={{padding: 10, position: 'absolute', left: 0, bottom: 0, right: 0}}>
            <Button onPress={() => {
                if (callback != null) {
                    if (location) {
                        callback(location)
                    } if (addressLocation) {
                        callback(addressLocation)
                    }
                }

                navigation.goBack()
            }} dark={!!(location || addressLocation)} light={!(location || addressLocation )} block>
                <Text style={{color: location || addressLocation ? 'white' : '#c0c0c0'}}>Confirm</Text>
            </Button>
       </View>
       
        </Container>
    )
}

LocationPage.navigationOptions = ({navigation}) => {
    const {state} = navigation

    return {
        title: 'Location',
        headerRight: <TopRight findMe={state.params.findMe} onFindMeChange={findMe => {
            navigation.getParam('findMeChanged')(findMe)
            navigation.setParams({findMe: findMe})
        }} />
    }
}