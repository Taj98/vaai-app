import React, { useState, useEffect } from 'react'
import { FormService } from '../../services/form-service'
import { EngineService } from '../../services/engine-service'
import { Container, Spinner, Text, View, Button, Icon } from 'native-base'
import { ChatForm } from '../../components/chat-form'
import * as form from '../../assets/forms/claim/vehicle.json'
import * as preSelectedPolicyForm from '../../assets/forms/claim/vehicle-selected-policy.json'
import * as incompletedClaimForm from '../../assets/forms/claim/short-process-continue.json'
import { Alert } from 'react-native'
import { ClaimService } from '../../services/claim-service'
import { PolicyService } from '../../services/policy-service'
import moment from 'moment'
import { VaaiColors } from '../../theme'
import { CustomHeader } from '../../components/custom-header'
import App from '../../../App'
import { UserService } from '../../services/user-service'
import PushNotification from 'react-native-push-notification'

export const ClaimPage = ({navigation}) => {
    const preSelectedPolicy = navigation.getParam('policy')
    const callback = navigation.getParam('callback')
    const [formValues, setFormValue] = useState({})
    const [incompleteClaim, setIncompleteClaim] = useState(false)
    const [prevForm, setPrevForm] = useState({
        loaded: false,
        form: null
    })

    useEffect(() => {
        ClaimService.findIncompleteClaim().then(policy => {
            if (policy) {
                console.log('Setting short claim')
                console.log(policy)
                setIncompleteClaim(policy)
                setPrevForm({
                    loaded: true
                })
                setFormValue({
                    ...formValues,
                    policy: {
                        value: policy
                    }
                })
            } else {
                if (preSelectedPolicy == null) {
                    setPrevForm({
                        loaded: true,
                        form: form
                    })
                    setFormValue({})
                } else {
                    setPrevForm({
                        loaded: true
                    })
                }
            }
        })
        
        
    }, [])

    /*const checkForUncompletedPolicies = () => { // essential because there is currently no way to disable a certain notification
        UserService.uid().then(uid => {
            if (uid) {
                return PolicyService.policies().then(policies => {
                    const now = moment().format('YYYY-MM-DD HH:mm:ss')
                    
                    PushNotification.cancelAllLocalNotifications()
                    policies.forEach(policy => {
                        if (now < policy.effective_date && !policy.picturesTaken) {
                            PushNotification.localNotificationSchedule({
                                id: ''+policy.policy_id,
                                message: 'Please take pictures of your car',
                                title: 'Urgent! Car Inspection Due',
                                date: moment(policy.effective_date).toDate(),
                                soundName: 'default',
                                autoCancel: false,
                                ongoing: true,
                                vibrate: true,
                                vibration: 300,
                                userInfo: {
                                    id: `${policy.policy_id}`
                                }
                            })
                        } else if (now < policy.anniversary_date && !policy.claimed) {
                            PushNotification.localNotificationSchedule({
                                title: 'Your cover is about to end',
                                message: 'If you are still driving, get more cover',
                                date: moment(policy.anniversary_date).subtract(30, 'minutes').toDate(),
                                vibrate: true,
                                vibration: 300,
                                soundName: 'default',
                                autoCancel: true
                            })
                        }
    
                        if (policy.effective_date < now && policy.anniversary_date > now && !policy.picturesTaken) {
                            PushNotification.localNotification({
                                id: JSON.stringify(policy.policy_id),
                                message: 'Please take pictures of your car',
                                title: 'Urgent! Car Inspection Due',
                                // soundName: 'default',
                                // autoCancel: true,
                                ongoing: true,
                                vibrate: false,
                                visibility: false,
                                userInfo: {
                                    id: JSON.stringify(policy.policy_id)
                                }
                            })
                        }
    
                        if (policy.claimed && policy.completedClaim === false) {
                            PushNotification.scheduleLocalNotification({
                                message: 'Please complete your claim on Vaai',
                                title: 'Claim Incomplete',
                                // soundName: 'default',
                                // autoCancel: true,
                                date: moment().add(1, 'hour').toDate(),
                                ongoing: true,
                                vibrate: true,
                                visibility: true
                            })
                        }
                    })
                })
            }
        })
    }*/

    const onDropdownList = (key, {sendMessage}) => {
        switch (key) {
            case 'policy':
              return PolicyService.policies().then(policies => {
                  policies = policies.filter(policy => {
                      if (policy.claimed) {
                          return false
                      }

                      const now = moment().format('YYYY-MM-DD HH:mm:ss')
                      if (policy.effective_date < now && policy.anniversary_date > now && policy.picturesTaken) {
                          return true
                      } else {
                          return false
                      }
                  })
                  
                if (policies.length == 0) {
                    sendMessage("You currently don't have any active policies", true)
                    setTimeout(() => {
                        FormService.remove('claim')
                    }, 1000)

                }

                  return policies.map(policy => {
                      return {
                          name: (policy.registration) + ` (${policy.policy_number})`,
                        //   name: (policy.registration) + ' (' + moment(policy.effective_date).format('YYYY-MM-DD HH:mm') + ' - ' + moment(policy.anniversary_date).format('YYYY-MM-DD HH:mm') + ') ' + policy.policy_number,
                          value: policy
                      }
                  })
              })
        }
    }

    const onAfterMessage = ({message}) => {
        if (preSelectedPolicy == null)
            FormService.add(message, 'claim', formValues)
    }

    const onCurrentMessage = (currentMessage) => {
        if (preSelectedPolicy == null)
            FormService.setCurrentMessage(currentMessage, 'claim')
    }

    const paymentValue = ({sendMessage, nextMessage}) => {
        const policy = formValues.policy.value ? formValues.policy.value : policy
        const message = `You chose R${numberDisplay(policy.sum_insured)} cover per day on this policy, this is the maximum we will spend on repairs/write-off costs including towing.`

        sendMessage(message, true)
        nextMessage('proceed1')
    }

    const numberDisplay = value => {
        return parseFloat(value).toFixed().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    const claim = ({sendMessage, nextMessage}) => {
        sendMessage('Submitting your claim...', true)
        const pickup = formValues.pickup ? formValues.pickup : formValues.pickup2

        const claim = {
            policy_id: formValues.policy.value.policy_id,
            loss_date: moment(formValues.createdAt).format('YYYY-MM-DD'),
            description: formValues.accidentReport ? formValues.accidentReport : '',
            data: {
                accident_time: formValues.accidentTime ? formValues.accidentTime : '',
                officer_name: formValues.officer ? formValues.officer : '-',
                police_station: formValues.policeStationName ? formValues.policeStationName : '-',
                case_number: formValues.policeStationNumber ? formValues.policeStationNumber : '-',
                contact_name: formValues.contactName ? formValues.contactName : '-',
                contact_number: formValues.contactNumber ? formValues.contactNumber : '-',
                pictures: {
                    front: formValues.frontPic ? formValues.frontPic : formValues.frontPic2,
                    side1: formValues.side1Pic ? formValues.side1Pic : formValues.side1Pic2,
                    side2: formValues.side2Pic ? formValues.side2Pic : formValues.side2Pic2,
                    back: formValues.backPic ? formValues.backPic : formValues.backPic2
                }
            }
        }

        if (formValues.odometer) {
            claim['data']['pictures']['odometer'] = formValues.odometer
        }

        if (formValues.accidentLocation) {
            claim['data']['accident_location'] = {
                latitude: formValues.accidentLocation.location.lat,
                longitude: formValues.accidentLocation.location.lng
            }
        }

        if (pickup) {
            claim['data']['vehicle_location'] = {
                latitude: pickup.location.lat,
                longitude: pickup.location.lng
            }
        }

        if (incompleteClaim) {
            claim['note'] = {
                note: 'Claim Completed',
                note_type: 'CLAIM_UPDATED'
            }

            ClaimService.updateClaim(claim, formValues.policy.value.policy_number).then(() => {
                if (callback != null) {
                    callback()
                }
                sendMessage('We got the claims information you have sent us.', true)
                sendMessage('Heva nice life, you got no stress baby 😎', true)
                // sendMessage('We will get intouch with you in the next 24 hours to tell you where to take your vehicle for repairs.', true)
                // sendMessage('Thank you, your claim has been submitted. Great, we will call you in the next 24 hours with details of where to take your vehicle to get repaired.', true)
                
                checkForUncompletedPolicies()
                setTimeout(() => {
                    FormService.remove('claim')
                }, 1000)
                
            })
        } else {
            

            if (formValues.fullprocess == 'Yes') {
                claim['note'] = {
                    note: 'Long Process',
                    note_type: 'NEW_CLAIM_LONG'
                }
            } else {
                claim['note'] = {
                    note: 'Short Process',
                    note_type: 'NEW_CLAIM_SHORT'
                }
            }

            claim['data']['date_reported'] = moment(formValues.createdAt).format('YYYY-MM-DD')

            ClaimService.submitClaim(claim, formValues.policy.value.policy_number, formValues.tow == 'Yes', formValues.fullprocess == 'Yes').then(() => {
                // console.log(formValues)
                if (callback != null) {
                    callback()
                }
                sendMessage('We got the claims information you have sent us.', true)
                // sendMessage('We will get intouch with you in the next 24 hours to tell you where to take your vehicle for repairs.', true)
                // sendMessage('Thank you, your claim has been submitted. Great, we will call you in the next 24 hours with details of where to take your vehicle to get repaired.', true)
                sendMessage('Heva nice life, you got no stress baby 😎', true)
                if (formValues.tow === 'Yes') {
                    nextMessage('requestTow')
                    
                } else {
                    sendMessage('We will get intouch with you in the next 24 hours to tell you where to take your vehicle for repairs.', true)
                }
                
                FormService.remove('claim')
                setTimeout(() => {
                    checkForUncompletedPolicies()
                }, 1000)
                
            })
        }
        
    }

    

    const onAction = (key, helpers) => {
        switch (key) {
            case 'paymentValue':
                paymentValue(helpers)
                break
            case 'sendTow': {
                App.showLoading('Requesting Tow')
                ClaimService.currentClaim().then(claim => {
                    return ClaimService.pickup(claim).then(() => {
                        helpers.sendMessage('Check the main screen for the button to track your service provider', true)
                    })
                })
                .catch(err => {
                    Alert.alert('Error', err.message)
                })
                .finally(() => {
                    App.stopLoading()
                })
                
                break
            }
            case 'claim':
                claim(helpers)
                break
            case 'selectPolicy':
                formValues['policy'] = {
                    name: moment(preSelectedPolicy.effective_date).format('YYYY-MM-DD HH:mm') + ' (' + preSelectedPolicy.registration + ')',
                    value: preSelectedPolicy
                }

                helpers.sendMessage('You are claiming on your policy that started on ' + formValues['policy'].value.effective_date + ' for a vehicle with license ' + formValues['policy'].value.registration)
                helpers.nextMessage('fullprocess')
                break
        }
    }

    console.log('Incomplete claim')
    console.log(incompleteClaim)
    
    return (
        <Container>
            {prevForm.loaded ? <ChatForm chatBubbleColor={VaaiColors.homeGreen} backgroundColor={VaaiColors.yellow} onCurrentMessage={onCurrentMessage} onAfterMessage={onAfterMessage} onAction={onAction} navigation={navigation} form={incompleteClaim ? incompletedClaimForm : (preSelectedPolicy ? preSelectedPolicyForm : form)} onDropdownList={onDropdownList} onValue={(key, value) => {
                console.log(value)
                setFormValue(values => {
                    values[key] = value

                    return values
                })

                switch (key) {
                    case 'policy':
                        return value.name
                }

                return value
            }} /> : 
            <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                <Spinner color='black' />
                <Text>Loading Form</Text>
            </View>}
        </Container>
    )
}

ClaimPage.navigationOptions = ({navigation}) => {
    return {
        title: 'Claim',
        header: <CustomHeader navigation={navigation} title='Claim' backgroundColor={VaaiColors.homeGreen} headerRight={
            <Button style={{display: 'none'}} transparent onPress={() => {
                Alert.alert('Exit Session', 'Are you sure you want to exit the session? You will lose all the information you have entered', [
                    {
                        text: 'Yes',
                        onPress: () => {
                            FormService.remove('claim')
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