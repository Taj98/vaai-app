import React from 'react'
import { Text, Container, Content, View, Form, Item, Input, Button, Label } from 'native-base'
import { Image, Alert } from 'react-native'
import { Formik } from 'formik'
import App from '../../App'
import * as Yup from 'yup'
import { UserService } from '../services/user-service'
import { VaaiColors } from '../theme'
import { VaaiBackground } from '../components/vaai-background'
import { connect } from 'react-redux'
import { setProfile } from '../redux/profile'

const LoginPage = ({
    navigation,
    setProfile
}) => {
    const { navigate, goBack } = navigation
    const schema = Yup.object().shape({
        phone: Yup.string().length(10).required(),
        password: Yup.string().required()
    })

    const login = (values) => {
        App.showLoading('Logging in...')

        let phone = values.phone
        if (phone[0] == '0') {
            phone = '27' + phone.substr(1, phone.length)
        }
        UserService.login(phone, values.password).then(profile => {
            setProfile(profile)
            goBack()
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
        <Container>
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
                    phone: '',
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
                            <Form style={{padding: 20, margin: 20, marginBottom: 10, backgroundColor: VaaiColors.purple}}>
                                <Text style={{color: 'white', marginBottom: 5}}>Phone Number</Text>
                                <Item regular style={{marginBottom: 20, height: 40, ...errorStyle(errors, 'phone'), backgroundColor: 'white'}}>
                                    <Input value={values.phone} onChangeText={handleChange('phone')} onBlur={handleBlur('phone')} keyboardType='phone-pad' />
                                </Item>

                                <Text style={{color: 'white', marginBottom: 5}}>Password</Text>
                                <Item regular style={{marginBottom: 20, height: 40, ...errorStyle(errors, 'password'), backgroundColor: 'white'}}>
                                    <Input autoCapitalize='none' value={values.password} onChangeText={handleChange('password')} onBlur={handleBlur('password')} secureTextEntry={true} />
                                </Item>

                                <Button small onPress={() => {
                                    handleSubmit()
                                }} block style={{marginBottom: 10, backgroundColor: VaaiColors.green}}>
                                    <Text>Login</Text>
                                </Button>

                                <Button small style={{backgroundColor: VaaiColors.red}} block onPress={() => navigate('SignUp')}>
                                    <Text>Sign Up</Text>
                                </Button>
                            </Form>
                        )
                    }}
                </Formik>

                <Button dark transparent block style={{marginBottom: 10}} onPress={() => navigate('ForgotPassword')}>
                    <Text style={{color: VaaiColors.purple}}>Forgot Password</Text>
                </Button>
            </Content>
        </Container>
    )
}

const dispatchToProps = dispatch => {
    return {
        setProfile: profile => dispatch(setProfile(profile))
    }
}

export default connect(null, dispatchToProps)(LoginPage)