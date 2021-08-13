import React from 'react'
import { Text, Container, Content, View, Form, Item, Input, Button } from 'native-base'
import { Image, Alert } from 'react-native'
import { Formik } from 'formik'
import App from '../../App'
import * as Yup from 'yup'
import { UserService } from '../services/user-service'
import { VaaiBackground } from '../components/vaai-background'
import { VaaiColors } from '../theme'

export const ForgotPasswordPage = (props) => {
    const { navigate } = props.navigation
    const schema = Yup.object().shape({
        phone: Yup.string().required()
    })

    const login = (values) => {
        App.showLoading('Sending Password Reset Code...')

        UserService.sendPasswordResetCode(values.phone).then(() => {
            navigate('VerifyForgotPassword', {
                phone: values.phone
            })
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
                            <Form style={{padding: 40}}>
                                <Text style={{textAlign: 'center', marginBottom: 20, color: VaaiColors.purple, fontWeight: 'bold'}}>Input your phone number below to reset your password</Text>
                                <Text style={{color: VaaiColors.purple, marginTop: 10, marginBottom: 5}}>Phone Number</Text>
                                <Item regular style={{marginBottom: 10, height: 40, backgroundColor: 'white', ...errorStyle(errors, 'phone')}}>
                                    <Input value={values.phone} onChangeText={handleChange('phone')} onBlur={handleBlur('phone')} keyboardType='decimal-pad' />
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