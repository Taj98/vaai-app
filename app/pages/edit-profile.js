import React, { useEffect, useState } from 'react'
import { Container, Content, Form, Item, Input, Button, Text, View } from 'native-base'
import { Formik } from 'formik'
import App from '../../App'
import { UserService } from '../services/user-service'
import { Alert } from 'react-native'
import prompt from 'react-native-prompt-android';
import { VaaiColors } from '../theme'
import { VaaiBackground } from '../components/vaai-background'
import { CustomHeader } from '../components/custom-header'
import { connect } from 'react-redux'
import { ProfileRequests } from '../redux/profile'

const EditProfilePage = ({
    navigation,
    profile,
    editProfile
}) => {
    const {goBack} = navigation
    const [isSavingProfile, setIsSavingProfile] = useState(false)

    useEffect(() => {
        if (profile.loading) {
            App.showLoading('Updating profile')
            setIsSavingProfile(true)
        } else {
            App.stopLoading()
        }
    }, [profile.loading])

    useEffect(() => {
        if (isSavingProfile) {
            goBack()
        }
    }, [profile])

    const update = (values) => {
        if (profile.profile.phone != values.phone) {
            prompt('Change Phone Number',
                'It looks like you are about to change your phone number. Please enter your password below',
                [
                    {
                        text: 'Cancel'
                    },
                    {
                        text: 'Save',
                        onPress: data => {
                            console.log(data)
                            App.showLoading('Checking password...')
                            UserService.login(profile.profile.phone, data).then(() => {
                                App.stopLoading()
                                return updatePhoneNumber(values)
                            }).catch(err => {
                                App.stopLoading()
                                Alert.alert('Error', err.message)
                            })
                        }
                    }
                ],
                {
                    type: 'secure-text',
                    placeholder: 'Password',
                    cancelable: false,
                })
        } else {
            updatePhoneNumber(values)
        }
        
    }

    const updatePhoneNumber = (values) => {
        editProfile(values)
        // App.showLoading('Updating Profile...')


        // UserService.updateProfile(values).then(() => {
        //     callback(values)
        //     goBack()
        // }).catch(err => {
        //     Alert.alert('Error', err.message)
        // }).finally(() => {
        //     App.stopLoading()
        // })
    }

    return (
        <Container style={{backgroundColor: VaaiColors.yellow}}>
            <VaaiBackground showTop={false} />
            <Content>
                <Formik onSubmit={(values) => update(values)} initialValues={profile.profile ? profile.profile : {
                    phone: '',
                    name: '',
                    surname: '',
                    idNumber: ''
                }}>
                    {({
                        values,
                        handleBlur,
                        handleChange,
                        handleSubmit
                    }) => {
                        return (
                            <Form style={{padding: 20, margin: 30, marginTop: 40, backgroundColor: VaaiColors.purple}}>
                                <Text style={{marginBottom: 5, color: 'white'}}>Phone Number</Text>
                                <Item regular style={{backgroundColor: 'white', height: 40, padding: 10, marginBottom: 10}}>
                                    <Input value={values.phone} onChangeText={handleChange('phone')} onBlur={handleBlur('phone')} />
                                </Item>
                                <Text style={{marginBottom: 5, color: 'white'}}>Name</Text>
                                <Item regular style={{backgroundColor: 'white', height: 40, padding: 10, marginBottom: 10}}>
                                    
                                    <Input value={values.name} autoCapitalize='words' onChangeText={handleChange('name')} onBlur={handleBlur('name')} />
                                </Item>
                                <Text style={{marginBottom: 5, color: 'white'}}>Surname</Text>
                                <Item regular style={{backgroundColor: 'white', height: 40, padding: 10, marginBottom: 10}}>
                                    
                                    <Input value={values.surname} autoCapitalize='words' onChangeText={handleChange('surname')} onBlur={handleBlur('surname')} />
                                </Item>
                                <Text style={{marginBottom: 5, color: 'white'}}>ID Number</Text>
                                <Item regular style={{backgroundColor: 'white', height: 40, padding: 10, marginBottom: 10}}>
                                    
                                    <Input value={values.idNumber} autoCapitalize='words' onChangeText={handleChange('idNumber')} onBlur={handleBlur('idNumber')} />
                                </Item>

                                <Button block small style={{backgroundColor: VaaiColors.green}} onPress={() => handleSubmit()}>
                        <Text>Update Profile</Text>
                    </Button>
                            </Form>
                        )
                    }}
                </Formik>

                {/* <View style={{alignItems: 'center', paddingLeft: 30, paddingRight: 30}}>
                    
                </View> */}
            </Content>
        </Container>
    )
}

EditProfilePage.navigationOptions = ({navigation}) => {
    return {
        title: 'Edit Profile',
        header: <CustomHeader navigation={navigation} title='Edit Profile' backgroundColor={VaaiColors.purple} />
    }
}

const stateToProps = state => {
    return {
        profile: state.profile
    }
}

const dispatchToProps = dispatch => {
    return {
        editProfile: profile => dispatch(ProfileRequests.editProfile(profile))
    }
}

export default connect(stateToProps, dispatchToProps)(EditProfilePage)