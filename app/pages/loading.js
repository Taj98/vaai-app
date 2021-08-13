import React, { useEffect, useState } from 'react'
import { View, Spinner } from 'native-base'
import { Image } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import { StackActions, NavigationActions } from 'react-navigation';
import { UserService } from '../services/user-service';
import { connect } from 'react-redux';
import { ProfileRequests } from '../redux/profile';

const LoadingPage = ({
    profile,
    getProfile,
    navigation
}) => {
    const [requestedProfile, setRequestedProfile] = useState(false)

    const checkProfile = () => {
        console.log('Checking profile')

            if (profile.profile) {
                    console.log(profile.profile)
                    let page
                        if (profile.profile.profilePicture == null) {
                            page = 'ProfilePicture'

                            const resetAction = StackActions.reset({
                                index: 0,
                                actions: [NavigationActions.navigate({ routeName: page })],
                            });
                            navigation.dispatch(resetAction);
                        } else if (profile.profile.licensePicture == null) { 
                            page = 'LicensePicture'

                            const resetAction = StackActions.reset({
                                index: 0,
                                actions: [NavigationActions.navigate({ routeName: page })],
                            });
                            navigation.dispatch(resetAction);
                        }
                        else {
                            AsyncStorage.getItem('@askedLocation').then(askedLocation => {
                                console.log('gotResult')
                                console.log(askedLocation)
                                if (askedLocation == null) {
                                    page = 'LocationRequired'
                                } else {
                                    page = 'App'
                                }
                            }).catch(() => {
                                page = 'LocationRequired'
                            }).finally(() => {
                                const resetAction = StackActions.reset({
                                    index: 0,
                                    actions: [NavigationActions.navigate({ routeName: page })],
                                });
                                navigation.dispatch(resetAction);
                            })
                        }
                    } else {
                        page = 'App'

                        const resetAction = StackActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({ routeName: page })],
                        });
                        navigation.dispatch(resetAction);
                    }
            }
            // else {
            //     const resetAction = StackActions.reset({
            //         index: 0,
            //         actions: [NavigationActions.navigate({ routeName: 'App' })],
            //     });
            //     navigation.dispatch(resetAction);
            // }
        // .catch(() => {
        //     console.log('Exception')
        //     const resetAction = StackActions.reset({
        //         index: 0,
        //         actions: [NavigationActions.navigate({ routeName: 'App' })],
        //       });
        //       navigation.dispatch(resetAction);
        // })
    

    useEffect(() => {
        getProfile()
    }, [])

    useEffect(() => {
        if (profile.loading) {
            console.log('Requested profile')
            setRequestedProfile(true)
        } else {
            console.log('Loading is false: ' + requestedProfile)
            if (requestedProfile) {
                console.log('Checking profile')
                checkProfile()
            }
        }
    }, [profile.loading])

    
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'}}>
            <Image resizeMethod='auto' resizeMode='contain' source={require('../assets/imgs/logo.png')} style={{width: 250, resizeMode: 'contain', marginBottom: 20}} />
            <Spinner color='black' />
        </View>
    )
}

const stateToProps = state => {
    return {
        profile: state.profile,
    }
}

const dispatchToProps = dispatch => {
    return {
        getProfile: () => dispatch(ProfileRequests.getProfile())
    }
}

export default connect(stateToProps, dispatchToProps)(LoadingPage)