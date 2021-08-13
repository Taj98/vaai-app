import React, { useState, useEffect } from 'react'
import { Container, Button, Icon, View, Spinner, Text } from "native-base"
import { Alert } from 'react-native'
import * as form from '../../assets/forms/roadside/roadside.json'
import { ChatForm } from '../../components/chat-form.js'
import { FormService } from '../../services/form-service.js'
import { RoadsideService } from '../../services/roadside-service.js'
import { PaymentService } from '../../services/payment-service.js'
import { VaaiColors } from '../../theme.js'
import { CustomHeader } from '../../components/custom-header.js'
import { UserService } from '../../services/user-service'

export const RoadsidePage = ({navigation}) => {
    let paymentId = null
    const [formValues, setFormValue] = useState({})
    
    const [prevForm, setPrevForm] = useState({
        loaded: false,
        form: null
    })

    useEffect(() => {
        
    }, [])

    const calculateCost = ({sendMessage, nextMessage}) => {
        sendMessage('We are waiting for a provider to accept your request. You will receive the cost as soon as we find a provider.', true)
        const pickUpLocation = formValues.location ? formValues.location : formValues.startLocation
        const dropoffLocation = formValues.endLocation
        const isOwner = formValues.forWho === 'Myself'

        UserService.profile().then(profile => {
            let problemType = ''
            if (formValues.fuel) {
                problemType = formValues.fuel
            } else if (formValues.patchOrSpare) {
                problemType = formValues.patchOrSpare
            }

            const request = {
                pickup: pickUpLocation,
                dropoff: dropoffLocation ? dropoffLocation : null,
                isOwner: isOwner,
                licensePlateNumber: isOwner ? formValues.scan.licensePlate : formValues.licensePlate,
                name: isOwner ? `${profile.name} ${profile.surname}` : formValues.contactName,
                phone: isOwner ? profile.cellphone : formValues.contactPhone,
                problem: formValues.problem,
                problemType: problemType,
                quoteRejected: false
            }
            console.log(request)

            RoadsideService.requestRoadside(request).then(() => {
                RoadsideService.listenForRoadsideRequestResult().subscribe(quote => {
                    sendMessage(`It will cost R${quote.premium} in total for the service selected`, true)
                    nextMessage('proceed1')
                    paymentId = quote.id
                })
            })
            
            // .then(data => {
            //     paymentId = data.id
            //   const cost = parseFloat(data.cost).toFixed(0)
            //   sendMessage(`It will cost R${cost} in total for the service selected`, true)
            //   nextMessage('proceed1')
            // })
        })
        
      }

    // useEffect(() => {
    //     FormService.form('roadside').then(form => {
    //         setPrevForm({
    //             loaded: true,
    //             form: form
    //         })
    //         setFormValue(form ? form.formValues : {})
    //     })
    // }, [])

    const onAfterMessage = ({message}) => {
        FormService.add(message, 'roadside', formValues)
    }

    const onCurrentMessage = (currentMessage) => {
        FormService.setCurrentMessage(currentMessage, 'roadside')
    }

    const onDropdownList = (key) => {
        
    }

    const payment = ({sendMessage, nextMessage}) => {
        let subscription
        sendMessage('Preparing your payment...', true)

        navigation.navigate('RoadsidePayment', {
            quoteId: paymentId,
            callback: () => {
                sendMessage('Thank you for your payment', true)
                sendMessage('Check the main screen for the button to track your service provider', true)
                console.log(formValues)
                if (formValues['problem'] === 'Run out of fuel') {
                    sendMessage('Remember to ask the service provider for the slip as proof of the 10 litre of fuel being bought', true)
                }
            }
        })
        // PaymentService.queuePayment('roadside', formValues, formValues.cost).then(id => {
        //   subscription = PaymentService.listenForPayment(id).subscribe(payment => {
        //     if (payment['paymentProcessed']) {
        //       if (payment['paymentSuccessful']) {
        //         sendMessage('Thank you for your payment', true)
        //         nextMessage('sendRequest', true)
        //         // this.chatForm.chatForm.sendMessage(`You can <a style="color: white !important;" href="${CLOUD_FUNCTIONS_SERVER}/genPolicy?id=${payment['policy']}" target="_blank">download your policy</a>`)
        //       } else {
        //         nextMessage('tryAgain')
        //       }
        //       subscription.unsubscribe()
        //     }
        //   })
    
        //   return PaymentService.payWithCard(id, this.cost).then(data => {
        //     sendMessage(`You can now <a style="color: white !important;" href="${data.paymentUrl}" target="_blank">Pay with card</a>`, true)
        //   })
        // })
      }

    const cancel = () => {
        RoadsideService.cancelCurrentPendingRoadside()
    }

    const onAction = (key, helpers) => {
        console.log('On action: ' + key)
        switch (key) {
            case 'checkCurrent':
                RoadsideService.currentPendingRoadsideRequest().then(request => {
                    if (request) {
                        helpers.sendMessage("We are waiting for a provider to accept your request. You will receive the cost as soon as we find a provider.", true)
                        RoadsideService.listenForRoadsideRequestResult().subscribe(quote => {
                            helpers.sendMessage(`It will cost R${quote.premium} in total for the service selected`, true)
                            helpers.nextMessage('proceed1')
                            paymentId = quote.id
                        })
                    } else {
                        helpers.nextMessage("forWho")
                    }
                    console.log(request)
                })
                break
            case 'calculateCost':
                calculateCost(helpers)
                break
            case 'payment':
                payment(helpers)
                break
            case 'cancel':
                cancel()
                helpers.nextMessage('comeBackLater')
                break
            case 'location': {
                navigation.navigate(formValues['forWho'] == 'Myself' ? 'Location' : 'FriendLocation', {
                    callback: location => {
                        const link = `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=17&size=600x300&maptype=roadmap` +
                        `&markers=color:red%7Clabel:L%7C${location.lat},${location.lng}` +
                        "&key=AIzaSyBCnCPfmBgplyJw3fsk1bVzZIKaNZYCwSg"
    
                        const currentValue = Object.assign({}, formValues)
                        const result = helpers.onValue(key, {
                            location: location,
                            link: link
                        })
                        setFormValue({
                            ...currentValue,
                            location: {
                                location: location,
                                link: link
                            }
                        })
                        helpers.sendImage(result.link, false)
                    }
                })
                break
            }
            case 'startLocation': {
                navigation.navigate(formValues['forWho'] == 'Myself' ? 'Location' : 'FriendLocation', {
                    callback: location => {
                        const link = `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=17&size=600x300&maptype=roadmap` +
                        `&markers=color:red%7Clabel:L%7C${location.lat},${location.lng}` +
                        "&key=AIzaSyBCnCPfmBgplyJw3fsk1bVzZIKaNZYCwSg"
    
                        const currentValue = Object.assign({}, formValues)
                        const result = helpers.onValue(key, {
                            location: location,
                            link: link
                        })
                        setFormValue({
                            ...currentValue,
                            startLocation: {
                                location: location,
                                link: link
                            }
                        })
                        helpers.sendImage(result.link, false)
                    }
                })
                break
            }
            case 'endLocation': {
                navigation.navigate('Location', {
                    callback: location => {
                        const link = `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=17&size=600x300&maptype=roadmap` +
                        `&markers=color:red%7Clabel:L%7C${location.lat},${location.lng}` +
                        "&key=AIzaSyBCnCPfmBgplyJw3fsk1bVzZIKaNZYCwSg"
    
                        const currentValue = Object.assign({}, formValues)
                        const result = helpers.onValue(key, {
                            location: location,
                            link: link
                        })
                        setFormValue({
                            ...currentValue,
                            endLocation: {
                                location: location,
                                link: link
                            }
                        })
                        helpers.sendImage(result.link, false)
                    }
                })
                break
            }
        }
    }

    return (
        <Container>
            <ChatForm chatBubbleColor={VaaiColors.orange} backgroundColor={VaaiColors.yellow} onCurrentMessage={onCurrentMessage} onAfterMessage={onAfterMessage} onAction={onAction} navigation={navigation} form={form} onDropdownList={onDropdownList} onValue={(key, value) => {
                
                setFormValue(values => {
                    values[key] = value

                    return values
                })

                switch (key) {
                    case 'policy':
                        return value.name
                    case 'scan':
                        return `Your car is a ${value.make}.`
                }

                return value
            }} /> 
            {/* <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                <Spinner color='black' />
                <Text>Loading Form</Text>
            </View> */}
        </Container>
    )
}

RoadsidePage.navigationOptions = ({navigation}) => {
    return {
        title: 'Roadside Assistance',
        header: <CustomHeader navigation={navigation} title='Roadside Assistance' backgroundColor={VaaiColors.orange} headerRight={
            <Button style={{display: 'none'}} transparent onPress={() => {
                Alert.alert('Exit Session', 'Are you sure you want to exit the session? You will lose all the information you have entered', [
                    {
                        text: 'Yes',
                        onPress: () => {
                            FormService.remove('roadside')
                            navigation.goBack()
                        }
                    },
                    {
                        text: 'No'
                    }
                ])
            }}>
                <Icon style={{color: 'white'}} name='exit' />
            </Button>
        } />
    }
}