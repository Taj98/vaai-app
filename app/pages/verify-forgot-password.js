import React from 'react'
import { Text, Container, Content, View, Form, Item, Input, Button } from 'native-base'
import { Image, Alert } from 'react-native'
import { Formik } from 'formik'
import App from '../../App'
import * as Yup from 'yup'
import { UserService } from '../services/user-service'
import { VaaiBackground } from '../components/vaai-background'
import { VaaiColors } from '../theme'

export const VerifyForgotPasswordPage = (props) => {
    const { navigate, getParam } = props.navigation
    const phone = getParam('phone')
    const schema = Yup.object().shape({
        code: Yup.string().required(),
        password: Yup.string().required()
    })

    const login = (values) => {
        App.showLoading('Resetting Password...')

        UserService.resetPassword(phone, values.code, values.password).then(() => {
            navigate('Home')
        }).catch(err => {
            Alert.alert('Error', err.message)
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
        <Container style={{backgroundColor: VaaiColors.yellow}}>
            <VaaiBackground />
            <Content>
                <View style={{alignItems: 'center', marginTop: 40}}>
                    <Image resizeMode='contain' source={require('../assets/imgs/logo.png')} style={{
                        width: 250,
                        height: 150
                    }} />
                </View>

                <Formik validationSchema={schema} onSubmit={(values) => {
                    login(values)
                }} initialValues={{
                    code: '',
                    password: ''
                }}>
                    {({
                        values,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                        errors
                    }) => {
                        return (
                            <Form style={{padding: 40}}>
                                <Text style={{textAlign: 'center', marginBottom: 20, color: VaaiColors.purple, fontWeight: 'bold'}}>We've sent you a verification code to your number. Input the code and your new password below</Text>

                                <Text style={{marginBottom: 5, color: VaaiColors.purple}}>Verification Code</Text>
                                <Item regular style={{marginBottom: 10, backgroundColor: 'white', height: 40, ...errorStyle(errors, 'code')}}>
                                    <Input value={values.code} onChangeText={handleChange('code')} onBlur={handleBlur('code')} keyboardType='decimal-pad' />
                                </Item>

                                <Text style={{marginBottom: 5, marginTop: 5, color: VaaiColors.purple}}>New Password</Text>
                                <Item regular style={{marginBottom: 10, backgroundColor: 'white', height: 40, ...errorStyle(errors, 'password')}}>
                                    <Input value={values.password} onChangeText={handleChange('password')} onBlur={handleBlur('password')} secureTextEntry={true} autoCapitalize={'none'} />
                                </Item>

                                <Button small onPress={() => {
                                    handleSubmit()
                                }} dark block style={{marginBottom: 10, backgroundColor: VaaiColors.red}}>
                                    <Text>Reset Password</Text>
                                </Button>
                            </Form>
                        )
                    }}
                </Formik>
            </Content>
        </Container>
    )
}