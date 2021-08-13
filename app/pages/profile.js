import React, { useState, useEffect } from 'react'
import { Container, Button, Icon, Content, View, Spinner, Text } from 'native-base'
import { UserService } from '../services/user-service'
import { Image } from 'react-native'
import { VaaiColors } from '../theme'
import { ProfileHeader } from '../components/profile-header'
import { VaaiBackground } from '../components/vaai-background'
import { connect } from 'react-redux'

const LineItem = ({color = 'black', title, value}) => {
    return (
        <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1, padding: 10}}>
                <Text style={{fontWeight: 'bold', color: color}}>{title}</Text>
                <Text style={{fontWeight: '100', color: color, fontSize: 12}}>{value}</Text>
                
            </View>
        </View>
    )
}

const ProfilePage = ({
    navigation,
    profile
}) => {
    useEffect(() => {
        navigation.setParams({profile: profile})
    }, [profile])

    const renderDOB = (idNumber) => {
        if (idNumber) {
            const year = idNumber.substr(0, 2)
            const month = idNumber.substr(2, 2)
            const day = idNumber.substr(4, 2)

            let century = '19'
            if (parseInt(year) < 20) {
                century = '20'
            }

            return `${century}${year}-${month}-${day}`
        }
    }

    return (
        <Container>
            <VaaiBackground showTop={false} />
            {profile ? 
            <Content>
                {/* <View style={{backgroundColor: VaaiColors.purple, flexDirection: 'row', padding: 10, alignItems: 'center'}}>
                    <View style={{flex: 1}}>
                        <Text style={{color: 'white', fontWeight: '100', fontSize: 28, marginBottom: 10}}>{profile.name} {profile.surname}</Text>
                        <Text style={{color: 'white', fontWeight: '100', marginBottom: 10}}>+{profile.phone}</Text>
                    </View>
                    <Image style={{width: 50, height: 50, borderRadius: 50}} source={{uri: profile.profilePicture}} />
                </View> */}

                <View style={{marginTop: 40, marginLeft: 30, marginRight: 30}}>  
                    <LineItem color={VaaiColors.blue} icon='calendar' title='Date of Birth' value={renderDOB(profile.idNumber)} />
                    <LineItem color={VaaiColors.orange} icon='person' title='ID Number' value={profile.idNumber} />
                    <LineItem color={VaaiColors.purple} icon='call' title='Phone' value={`+${profile.phone}`} />
                    <LineItem color={VaaiColors.green} icon='checkbox' title='Profile' value='Active' />
                </View>
                
            </Content> : 
            <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                <Spinner color='black' />
            </View>}
        </Container>
    )
}

ProfilePage.navigationOptions = ({navigation}) => {
    const {state, setParams} = navigation;


    const profile = state.params ? state.params.profile : null

    return {
        title: '',
        headerStyle: {
            backgroundColor: VaaiColors.purple
        },
        header: <ProfileHeader 
            navigation={navigation}
            backgroundColor={VaaiColors.purple}
            title={profile ? (profile.name + ' ' + profile.surname) : ''}
            subtitle={profile ? profile.phone : ''}
            image={profile ? profile.profilePicture : null}
            headerRight={
                state.params && profile ? <Button transparent onPress={() => {
                    navigation.navigate('EditProfile', {
                        profile: profile,
                        callback: (profile) => {
                            setParams({
                                profile: profile
                            })
                        }
                    })
                }}>
                    <Icon style={{color: 'white'}} name='create' />
                </Button> : <View></View>
            } />
    }
}

const propsToState = state => {
    return {
        profile: state.profile.profile
    }
}

export default connect(propsToState)(ProfilePage)