import React from 'react'
import { Text, Container, Content, View, Form, Item, Input, Button } from 'native-base'
import { Image, Alert } from 'react-native'
import { Formik } from 'formik'
import App from '../../App'
import * as Yup from 'yup'
import { UserService } from '../services/user-service'
import { StackActions, NavigationActions } from 'react-navigation'
import { setProfile } from '../redux/profile'
import { connect } from 'react-redux'

const VerifyPhonePage = ({
    navigation,
    setProfile
}) => {
    const { getParam } = navigation
    const profile = getParam('profile')
    const password = getParam('password')
    const schema = Yup.object().shape({
        code: Yup.string().required()
    })

    const login = (values) => {
        App.showLoading('Verifying Phone Number...')

        UserService.confirmPhoneNumber(profile.phone, values.code).then(() => {
            return UserService.signup(profile.phone, password, profile).then(() => {
                setProfile(profile)
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'ProfilePicture' })],
                });
                navigation.dispatch(resetAction);
                
                // navigate('ProfilePicture')
            })
        }).catch(err => {
            if (err.code == 'auth/email-already-in-use') {
                Alert.alert('Error', 'The phone number is already in use by another account')
            } else {
                Alert.alert('Error', err.message)
            }
        }).finally(() => {
            App.stopLoading()
        })
    }

    const errorStyle = (errors, field) => {
        if (errors[field]) {
            return {
                borderColor: 'red'
            }
        }

        return {}
    }

    return (
        <Container>
            <Content>
                <View style={{alignItems: 'center', marginTop: 40}}>
                    <Image resizeMode='contain' source={require('../assets/imgs/logo.png')} style={{
                        width: 150,
                        height: 150
                    }} />
                </View>

                <Formik validationSchema={schema} onSubmit={(values) => {
                    console.log('Submitted')
                    login(values)
                }} initialValues={{
                    code: ''
                }}>
                    {({
                        values,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                        errors
                    }) => {
                        return (
                            <Form style={{padding: 10}}>
                                <Text style={{textAlign: 'center', marginBottom: 20}}>We've sent you a verification code to the number you entered. Input the code below to continue with your registration</Text>
                                <Item regular style={{marginBottom: 10, ...errorStyle(errors, 'code')}}>
                                    <Input value={values.code} onChangeText={handleChange('code')} onBlur={handleBlur('code')} placeholder='Verification Code' keyboardType='decimal-pad' />
                                </Item>

                                <Button onPress={() => {
                                    handleSubmit()
                                }} dark block style={{marginBottom: 10}}>
                                    <Text>Sign Up</Text>
                                </Button>
                            </Form>
                        )
                    }}
                </Formik>
            </Content>
        </Container>
    )
}

const dispatchToProps = dispatch => {
    return {
        setProfile: profile => dispatch(setProfile(profile))
    }
}

export default connect(null, dispatchToProps)(VerifyPhonePage)