import React, {useState, useEffect} from 'react';
import {Container, View, Spinner, Text, Button, Icon} from 'native-base';
import {ChatForm} from '../components/chat-form';
import {FormService} from '../services/form-service';
import * as form from '../assets/forms/buy-cover/take-pictures.json';
import {Alert} from 'react-native';
import App from '../../App';
import {PolicyService} from '../services/policy-service';
import {UserService} from '../services/user-service';
import moment from 'moment';
import PushNotification from 'react-native-push-notification';
import {CustomHeader} from '../components/custom-header';
import {VaaiColors} from '../theme';
import OBDService from '../obd-service';

export const UploadPolicyPhotosPage = ({navigation}) => {
  const policyId = navigation.getParam('policyId');
  const callback = navigation.getParam('callback');
  const [formValues, setFormValue] = useState({});
  const [policy, setPolicy] = useState(null);
  const [prevForm, setPrevForm] = useState({
    loaded: false,
    form: null,
  });

  useEffect(() => {
    PolicyService.policy(policyId).then(policy => {
      setPolicy(policy);
      setPrevForm({
        loaded: true,
      });
    });
    // FormService.form('upload-policy-photos-' + policyId).then(form => {
    //     setPrevForm({
    //         loaded: true,
    //         form: form
    //     })
    //     setFormValue(form ? form.formValues : {})
    // })

    setFormValue({});
  }, []);

  /*const checkForUncompletedPolicies = () => {
    // essential because there is currently no way to disable a certain notification
    UserService.uid().then(uid => {
      if (uid) {
        return PolicyService.policies().then(policies => {
          const now = moment().format('YYYY-MM-DD HH:mm:ss');

          // console.log('Cancelling notifications')

          PushNotification.cancelAllLocalNotifications();
          policies.forEach(policy => {
            // console.log('Now: ' + now)
            // console.log('Effective Date: ' + policy.effective_date)
            if (now > policy.effective_date && !policy.picturesTaken) {
              console.log(
                'Setting up inspection notification for policy ' +
                  policy.policy_id,
              );

              // console.log(moment().add(5, 'seconds').toDate())
              // console.log(moment(policy.effective_date).toDate())
              PushNotification.localNotificationSchedule({
                id: '' + policy.policy_id,
                message: 'Please take pictures of your car',
                title: 'Urgent! Car Inspection Due',
                date: moment(policy.effective_date).toDate(),
                soundName: 'default',
                autoCancel: false,
                ongoing: true,
                vibrate: true,
                vibration: 300,
                userInfo: {
                  id: `${policy.policy_id}`,
                },
              });
            } else if (now < policy.anniversary_date && !policy.claimed) {
              console.log(
                'Setting up ending notification for policy ' + policy.policy_id,
              );
              PushNotification.localNotificationSchedule({
                title: 'Your cover is about to end',
                message: 'If you are still driving, get more cover',
                date: moment(policy.anniversary_date)
                  .subtract(30, 'minutes')
                  .toDate(),
                vibrate: true,
                vibration: 300,
                soundName: 'default',
                autoCancel: true,
              });
            }

            if (
              policy.effective_date < now &&
              policy.anniversary_date > now &&
              !policy.picturesTaken
            ) {
              console.log('Active policy: ' + policy.policy_id);
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
                  id: JSON.stringify(policy.policy_id),
                },
              });
            }

            if (policy.claimed && policy.completedClaim === false) {
              PushNotification.localNotification({
                message: 'Please complete your claim on Vaai',
                title: 'Claim Incomplete',
                // soundName: 'default',
                // autoCancel: true,
                ongoing: true,
                vibrate: false,
                visibility: false,
              });
            }
          });
        });
      }
    });
  };*/

  const submit = ({sendMessage}) => {
    const keys = Object.keys(formValues);
    App.showLoading('Uploading self inspection');
    const photos = keys
      .map(key => {
        return {
          path: formValues[key],
          name: key,
        };
      })
      .filter(item => item.path.includes('file')); // remove items that do not have a file path

    PolicyService.uploadPictures(policyId, photos)
      .catch(err => {
        // Alert.alert('Error', err.message)
        console.log('Error uploadingPictures', err);
      })
      .then(() => {
        sendMessage('You are now ready to Vaai!', true);
        sendMessage(
          'For the daily product please make sure this phone and the data logger are connected. For the 30 day, data logger is optional.',
          true,
        );
        sendMessage('Heva nice life, you got no stress baby 😎', true);
        console.log('Canceling: ' + policyId);
        PushNotification.cancelAllLocalNotifications();
        checkForUncompletedPolicies();
        if (callback != null) {
          callback();
        }

        OBDService.registerPolicy(
          policy.policy_number,
          policy.effective_date,
          policy.anniversary_date,
          () => {},
          () => {},
        );

        // UserService.uid().then(uid => {
        //     if (uid) {
        //         return PolicyService.policies().then(policies => {
        //             const now = moment().format('YYYY-MM-DD HH:mm:ss')

        //             console.log('Cancelling notifications')
        //             PushNotification.cancelAllLocalNotifications()
        //             policies.forEach(policy => {
        //                 // console.log('Now: ' + now)
        //                 // console.log('Effective Date: ' + policy.effective_date)
        //                 if (now < policy.effective_date && !policy.picturesTaken) {
        //                     console.log('Setting up inspection notification for policy ' + policy.policy_id)

        //                     // console.log(moment().add(5, 'seconds').toDate())
        //                     // console.log(moment(policy.effective_date).toDate())
        //                     PushNotification.localNotificationSchedule({
        //                         message: 'Your policy will only be valid as soon as you do a vehicle self inspection. Click here to start',
        //                         title: 'Self Inspection Due',
        //                         date: moment(policy.effective_date).toDate(),
        //                         soundName: 'default',
        //                         autoCancel: false,
        //                         ongoing: true
        //                     })
        //                 } else if (now < policy.anniversary_date && !policy.claimed) {
        //                     console.log('Setting up ending notification for policy ' + policy.policy_id)
        //                     PushNotification.localNotificationSchedule({
        //                         message: 'Your policy is about to end. Please make sure you fill in any claims within 30 min of your policy end time',
        //                         bigText: 'Self Inspection Due',
        //                         date: moment(policy.anniversary_date).toDate(),
        //                         priority: true
        //                     })
        //                 }
        //             })
        //         })
        //     }
        // })
      })
      .finally(() => {
        App.stopLoading();
      });
  };

  const onAction = (key, helpers) => {
    console.log('On action: ' + key);
    switch (key) {
      case 'submit':
        submit(helpers);
        break;
    }
  };

  const onAfterMessage = ({message}) => {
    FormService.add(message, 'upload-policy-photos-' + policyId, formValues);
  };

  const onCurrentMessage = currentMessage => {
    FormService.setCurrentMessage(
      currentMessage,
      'upload-policy-photos-' + policyId,
    );
  };

  return (
    <Container>
      {prevForm.loaded ? (
        <ChatForm
          chatBubbleColor={VaaiColors.blue}
          backgroundColor={VaaiColors.yellow}
          onCurrentMessage={onCurrentMessage}
          onAfterMessage={onAfterMessage}
          onAction={onAction}
          navigation={navigation}
          form={form}
          onValue={(key, value) => {
            setFormValue(values => {
              if (values == null) {
                values = {};
              }
              values[key] = value;

              return values;
            });

            return value;
          }}
        />
      ) : (
        <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
          <Spinner color="black" />
          <Text>Loading Form</Text>
        </View>
      )}
    </Container>
  );
};

UploadPolicyPhotosPage.navigationOptions = ({navigation}) => {
  const policyId = navigation.getParam('policyId');

  return {
    title: 'Self Inspection',
    header: <CustomHeader title="Self Inspection" navigation={navigation} />,
    // headerRight: () => {
    //     return (
    //         <Button transparent onPress={() => {
    //             Alert.alert('Exit Session', 'Are you sure you want to exit the session? You will lose all the information you have entered', [
    //                 {
    //                     text: 'Yes',
    //                     onPress: () => {
    //                         FormService.remove('upload-policy-photos-' + policyId)
    //                         navigation.goBack()
    //                     }
    //                 },
    //                 {
    //                     text: 'No'
    //                 }
    //             ])
    //         }}>
    //             <Icon style={{color: 'white'}} name='exit' />
    //         </Button>
    //     )
    // }
  };
};
