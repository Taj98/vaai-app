import React from 'react'
import { Text, Container, Content, View, Form, Item, Input, Button, Picker } from 'native-base'
import { Image, Alert } from 'react-native'
import { Formik } from 'formik'
import App from '../../App'
import * as Yup from 'yup'
import { UserService } from '../services/user-service'
import { VaaiBackground } from '../components/vaai-background'
import { VaaiColors } from '../theme'
import { isDobLessThan18Years, getDobFromIDNumber, inputHasSpecialCharacters, numberInputHasOtherCharacters } from '../utils/date-helper'

export const SignUpPage = (props) => {
    let globalHandleSubmit = null
    const { navigate } = props.navigation
    const schema = Yup.object().shape({
        name: Yup.string().min(2, ' ').required(' ')
            .test('nameHasSpecialCharacters', 'First name cannot have special characters or numbers', function(value) {
                return inputHasSpecialCharacters(value) 
            }),
        surname: Yup.string().min(2, ' ').required('')
            .test('surnameHasSpecialCharacters', 'Last name cannot have special characters or numbers', function (value) {
            return inputHasSpecialCharacters(value) 
        }),
        idNumber: Yup.string().required(' ')
            .test('idNumberHasNonNumbers', 'ID number must only contain numbers', function(value) {
                return !numberInputHasOtherCharacters(value)
            })
            .length(13, ' '),
        phone: Yup.string().length(10).required(),
        password: Yup.string().required(),
        gender: Yup.string().required(),
        dob: Yup.string()
            .required(' ')
            .test('dob-18years-min', 'You must be at least 18 years old to register', function (value) {
                return !isDobLessThan18Years(value)
            }),
        email: Yup.string().email(),
        confirmPassword: Yup.string()
            .required('Required')
            .test('passwords-match', "Passwords don't match", function (value) {
                return this.parent.password === value;
            }),
    })

    const autoPopulateDob = (idNumber, values) => {
        if (idNumber.length >= 6) {
            const dobString = getDobFromIDNumber(idNumber)
            values.dob = dobString
        } else {
            values.dob = ''
        }
    }

    
    const signup = (values) => {
        App.showLoading('Signing up...')
        const profile = values
        const password = values.password
        delete values.password
        delete values.confirmPassword

        UserService.verifyNumber(values.phone).then(() => {
            navigate('VerifyPhone', {
                profile: profile,
                password: password
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
            <Content style={{marginBottom: 90, marginTop: 90}}>
                <View style={{alignItems: 'center'}}>
                    <Image resizeMode='contain' source={require('../assets/imgs/logo.png')} style={{
                        width: 250,
                        height: 150
                    }} />
                </View>

                <Formik validationSchema={schema} onSubmit={(values) => {
                    signup(values)
                }} initialValues={{
                    name: '',
                    surname: '',
                    idNumber: '',
                    phone: '',
                    password: '',
                    gender: '',
                    dob: '',
                    dobDay: '',
                    dobMonth: '',
                    dobYear: '',
                    email: '',
                    confirmPassword: '',
                    agentCode: ''
                }}>
                    {({
                        values,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                        errors,
                        touched
                    }) => {
                        globalHandleSubmit = handleSubmit
                        return (
                            <Form style={{padding: 30, margin: 20, marginTop: 0, backgroundColor: VaaiColors.purple}}>
                                <Text style={{color: 'white', marginBottom: 5}}>First Name</Text>
                                <Item regular style={{marginBottom: 10, backgroundColor: 'white', height: 40, ...errorStyle(errors, 'name')}}>
                                    <Input value={values.name} onChangeText={handleChange('name')} onBlur={handleBlur('name')} autoCapitalize='words' />
                                </Item>
                                {errors.name && <Text style={{ color: 'red', marginBottom: 5 }}>{errors.name}</Text>}
                                <Text style={{color: 'white', marginBottom: 5}}>Last Name</Text>
                                <Item regular style={{marginBottom: 10, backgroundColor: 'white', height: 40, ...errorStyle(errors, 'surname')}}>
                                    <Input value={values.surname} onChangeText={handleChange('surname')} onBlur={handleBlur('surname')} autoCapitalize='words' />
                                </Item>
                                {errors.surname && <Text style={{ color: 'red', marginBottom: 5 }}>{errors.surname}</Text>}
                                <Text style={{color: 'white', marginBottom: 5}}>ID Number</Text>
                                <Item regular style={{marginBottom: 10, backgroundColor: 'white', height: 40, ...errorStyle(errors, 'idNumber')}}>
                                    <Input value={values.idNumber} onChangeText={idNumber => {
                                        handleChange('idNumber')(idNumber)
                                        autoPopulateDob(idNumber, values)
                                    }} onBlur={handleBlur('idNumber')} keyboardType='decimal-pad' />
                                </Item>
                                {errors.idNumber && <Text style={{ color: 'red', marginBottom: 5 }}>{errors.idNumber}</Text>}    
                                {errors.dob && <Text style={{ color: 'red', marginBottom: 5 }}>{errors.dob}</Text>}    
                                <Text style={{ color: 'white', marginBottom: 5 }}>Date of Birth</Text>
                                <Item regular style={{marginBottom: 10, backgroundColor: 'white', height: 40, ...errorStyle(errors, 'dob')}}>
                                    <Input autoCapitalize='none' value={values.dob} onChangeText={handleChange('dob')} disabled={true} style={{ color: 'grey' }} />
                                </Item>
                                <Text style={{color: 'white', marginBottom: 5}}>Phone Number (eg. 0711234567)</Text>
                                <Item regular style={{marginBottom: 10, backgroundColor: 'white', height: 40, ...errorStyle(errors, 'phone')}}>
                                    <Input value={values.phone} onChangeText={handleChange('phone')} onBlur={handleBlur('phone')} keyboardType='phone-pad' />
                                </Item>
                                <Text style={{color: 'white', marginBottom: 5}}>Email Address (Optional)</Text>
                                <Item regular style={{marginBottom: 10, backgroundColor: 'white', height: 40, ...errorStyle(errors, 'email')}}>
                                    <Input autoCapitalize='none' value={values.email} onChangeText={handleChange('email')} onBlur={handleBlur('email')} keyboardType='email-address' />
                                </Item>
                                <Text style={{color: 'white', marginBottom: 5}}>Gender</Text>
                                <Item regular style={{marginBottom: 10, backgroundColor: 'white', height: 40, ...errorStyle(errors, 'gender')}} picker>
                                    <Picker selectedValue={values.gender} onValueChange={value => handleChange('gender')(value)}>
                                        <Picker.Item value={null} label='' />
                                        <Picker.Item value='male' label='Male' />
                                        <Picker.Item value='female' label='Female' />
                                    </Picker>
                                </Item>
                                
                                <Text style={{color: 'white', marginBottom: 5}}>Password</Text>
                                <Item regular style={{marginBottom: 10, backgroundColor: 'white', height: 40, ...errorStyle(errors, 'password')}}>
                                    <Input autoCapitalize='none' value={values.password} onChangeText={handleChange('password')} onBlur={handleBlur('password')} secureTextEntry={true} />
                                </Item>

                                <Text style={{color: 'white', marginBottom: 5}}>Confirm Password</Text>
                                {errors.confirmPassword && touched.password && <Text style={{color: 'red', marginBottom: 5}}>Passwords don't match</Text>}
                                <Item regular style={{marginBottom: 10, backgroundColor: 'white', height: 40, ...errorStyle(errors, 'confirmPassword')}}>
                                    <Input autoCapitalize='none' value={values.confirmPassword} onChangeText={handleChange('confirmPassword')} onBlur={handleBlur('confirmPassword')} secureTextEntry={true} />
                                </Item>

                                <Text style={{color: 'white', marginBottom: 5}}>VaaiStar Agent Code (Optional)</Text>
                                <Item regular style={{marginBottom: 10, backgroundColor: 'white', height: 40, ...errorStyle(errors, 'agentCode')}}>
                                    <Input value={values.agentCode} onChangeText={handleChange('agentCode')} onBlur={handleBlur('agentCode')} />
                                </Item>

                                
                            </Form>
                        )
                    }}
                </Formik>

                <Button small onPress={() => {
                    globalHandleSubmit()
                }} dark block style={{marginLeft: 30, marginRight: 30, marginBottom: 10, backgroundColor: VaaiColors.greenAccent}}>
                    <Text>Sign Up</Text>
                </Button>
            </Content>
        </Container>
    )
}