import React, { useState, useEffect } from 'react'
import { Container, View, Text, List, ListItem, Left, Icon, Body, Button, Spinner } from 'native-base'
import { Image, Linking, Alert, AsyncStorage } from 'react-native'
import { UserService } from '../services/user-service'
import { VaaiColors } from '../theme'
import { connect } from 'react-redux'
import { requestConnectDevice } from '../redux/obd-device/obd-device-action'
import { setProfile } from '../redux/profile'
import { DeviceService } from '../services/device-service'

const Drawer = ({removeProfile, navigation, obdDevice, requestConnectDevice, profile}) => {
    const [appVersion, setAppVersion] = useState(null)
    const loggedOutMenu = [
        {
            text: 'Login',
            icon: 'person',
            color: '#38c2ec',
            onPress: () => {
                navigation.navigate('Login')
            }
        },
        {
            text: 'Contact Us',
            color: '#24cd63',
            icon: 'logo-whatsapp',
            onPress: () => {
                Linking.openURL('https://api.whatsapp.com/send?phone=27680547287')
            }
        }
    ]

    const loggedInMenu = [
        {
            text: 'Profile',
            icon: 'person',
            color: VaaiColors.purple,
            onPress: () => {
                navigation.navigate('Profile')
            }
        },
        {
            text: 'Policies',
            icon: 'car',
            color: VaaiColors.blue,
            onPress: () => {
                navigation.navigate('Policies')
            }
        },
        {
            text: 'History',
            icon: 'list-box',
            color: VaaiColors.homeGreen,
            onPress: () => {
                navigation.navigate('History')
            }
        },
        {
            text: 'Vehicle Check Up',
            icon: 'alert',
            color: VaaiColors.red,
            onPress: () => {
                navigation.navigate('ErrorCodes')
            }
        },
        {
            text: 'Accident Checklist',
            icon: 'list',
            color: VaaiColors.orange,
            onPress: () => {
                navigation.navigate('AccidentChecklist')
            }
        },
        loggedOutMenu[1]
    ]

    // useEffect(() => {
    //     const subscription = UserService.isLoggedIn().subscribe(user => {
    //         if (user == null) {
    //             setProfile(null)
    //         } else {
    //             UserService.profile(user.uid).then(profile => {
    //                 // console.log(profile)
    //                 setProfile(profile)
    //             })
    //         }
    //     })

    //     return () => {
    //         subscription.unsubscribe()
    //     }
    // }, [profile ? `${profile.name} ${profile.surname} ${profile.phone}` : null])

    const addDevice = () => {
        navigation.navigate('AddDevice')
    }

    useEffect(() => {
        DeviceService.deviceInfo().then(result => {
            setAppVersion(result.appVersion)
        })
    }, [])

    return (
        <Container>
            <View style={{backgroundColor: 'black', height: 170}}>
                <View style={{alignItems: 'flex-end', margin: 15}}>
                    <Image source={require('../assets/imgs/logo.png')} resizeMode='contain' style={{width: 80, height: 80}} />
                </View>

                <View style={{flexDirection: 'row', position: 'absolute', left: 20, top: 20}}>
                    {!obdDevice.paired && <Button small rounded bordered light onPress={addDevice}>
                        <Text style={{textTransform: 'none'}}>Add Device</Text>
                    </Button>}

                    {obdDevice.paired && (
                        <Text style={{color: 'green'}}>Device Linked</Text>
                    )}

                    {/* {!obdDevice.connected && !obdDevice.connecting && obdDevice.deviceId && <Button small rounded bordered light onPress={() => {
                        requestConnectDevice(obdDevice.deviceId)
                        
                    }}>
                        <Text style={{textTransform: 'none'}}>Connect Device</Text>
                    </Button>} */}

                    {obdDevice.connected && <Text style={{textTransform: 'none', color: VaaiColors.green}}>OBD Connected</Text>}
                    {/* {obdDevice.connecting == true && <Spinner color='white' />} */}
                </View>

                
                <View style={{flex: 1, justifyContent: 'flex-end', padding: 10}}>
                    {profile ? 
                    <View>
                        <Text style={{color: 'white', fontWeight: 'bold'}}>{profile.name} {profile.surname}</Text>
                        <Text style={{color: 'white'}}>+{profile.phone}</Text> 
                    </View>
                    : <Text style={{color: 'white', fontWeight: 'bold'}}>Vaai</Text>}
                </View>
            </View>

            <View style={{flex: 1}}>
            <List>
            {(profile == null ? loggedOutMenu : loggedInMenu).map((option, index) => {
                return (
                    
                        <ListItem key={index} icon button onPress={() => {
                            option.onPress()
                            navigation.closeDrawer()
                        }}>
                            <Left>
                                <Icon style={{color: option.color}} name={option.icon} />
                            </Left>
                            <Body>
                                <Text>{option.text}</Text>
                            </Body>
                        </ListItem>
                )
            })}
            </List>
            </View>
            {appVersion && <View style={{padding: 10}}>
                <Text style={{textAlign: 'right', fontSize: 12, color: 'grey'}}>V{appVersion}</Text>
            </View>}
            {profile && <Button light iconLeft block style={{justifyContent: 'flex-start'}} onPress={() => {
                navigation.closeDrawer()
                Alert.alert('Logout', 'Are you sure you want to logout?', [
                    {
                        text: 'Yes',
                        onPress: () => {
                            UserService.logout()
                            removeProfile()
                        }
                    },
                    {
                        text: 'No'
                    }
                ])
            }}>
                <Icon name='exit' />
                <Text>Logout</Text>
            </Button>}
        </Container>
    )
}

const statesToProps = states => {
    return {
        obdDevice: states.obdDevice,
        profile: states.profile.profile
    }
}

const dispatchToProps = dispatch => {
    return {
        removeProfile: () => dispatch(setProfile(null)),
        requestConnectDevice: deviceId => dispatch(requestConnectDevice(deviceId))
    }
}

export default connect(statesToProps, dispatchToProps)(Drawer)