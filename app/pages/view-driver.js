import React, { useEffect, useState } from 'react'
import { Container, View, Item, List, ListItem, Button, Text, Spinner, Icon, Card } from "native-base"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { ScrollView, TouchableOpacity, Linking } from "react-native"
import { RoadsideService } from '../services/roadside-service'

export const ViewDriverPage = ({navigation}) => {
    const {getParam} = navigation
    const pickup = getParam('pickup')
    const [driver, setDriver] = useState(null)
    const [loading, setLoading] = useState(true)
    const locationToRender = null
    const location = null

    useEffect(() => {
        RoadsideService.driverLocation(pickup).subscribe(driver => {
            setDriver(driver)
            setLoading(false)
            console.log(driver)
        })
    }, [])

    return (
        <Container style={{flex: 1, flexDirection: 'row'}}>
            {driver && <MapView provider={PROVIDER_GOOGLE} style={{flex: 1}} 
            region={driver ? {
                latitude: driver.position.lat,
                longitude: driver.position.lng,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            } : {
                latitude: 27,
                longitude: -28,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            }} >

        {driver && <Marker coordinate={{
            latitude: driver.position.lat,
            longitude: driver.position.lng
        }} />}

       </MapView>}
       {driver == null && loading == false && (
           <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40}}>
               <View style={{alignItems: 'center', justifyContent: 'center', backgroundColor: 'grey', width: 80, height: 80, borderRadius: 80, marginBottom: 20}}>
                    <Icon style={{fontSize: 45, color: 'white'}} name='car' />
               </View>
               <Text style={{textAlign: 'center'}}>We are still looking for a tow driver to assist you</Text>
           </View>
       )}

       {loading && <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><Spinner color='black' /></View>}

       {/* <View style={{padding: 10, position: 'absolute', left: 0, bottom: 0, right: 0}}>
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
       </View> */}

       {driver && <Card style={{padding: 10, position: 'absolute', left: 10, right: 10, bottom: 10, backgroundColor: 'white'}}>
            <Text style={{fontSize: 18}}>{driver.name} {driver.surname} is on the way</Text>
            <View style={{flexDirection: 'row', paddingTop: 10, justifyContent: 'flex-end'}}>
                <TouchableOpacity style={{marginRight: 10}} onPress={() => {
                    if (driver.cellphone[0] == '0') {
                        driver.cellphone = '27' + driver.cellphone.substr(1, driver.cellphone.length)
                    }
                    Linking.openURL(`tel:+${driver.cellphone}`)
                }}>
                    <View style={{width: 40, height: 40, borderRadius: 40, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon style={{color: 'white', fontSize: 20}} name='call' />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={{marginRight: 10}} onPress={() => {
                    if (driver.cellphone[0] == '0') {
                        driver.cellphone = '27' + driver.cellphone.substr(1, driver.cellphone.length)
                    }
                    Linking.openURL(`https://api.whatsapp.com/send?phone=${driver.cellphone}`)
                }}>
                    <View style={{width: 40, height: 40, borderRadius: 40, backgroundColor: 'green', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon style={{color: 'white', fontSize: 20}} name='logo-whatsapp' />
                    </View>
                </TouchableOpacity>
            </View>
       </Card>}
       
        </Container>
    )
}

ViewDriverPage.navigationOptions = {
    title: 'Driver Location'
}