import React, {useEffect, useState} from 'react';
import {
  Container,
  Content,
  Card,
  CardItem,
  Text,
  Button,
  Icon,
  Fab,
} from 'native-base';
import {TouchableOpacity, Image, View, Alert} from 'react-native';
import {UserService} from '../services/user-service';
import App from '../../App';
import PushNotification from 'react-native-push-notification';
import {PolicyService} from '../services/policy-service';
import moment from 'moment';
import {RoadsideService} from '../services/roadside-service';
import {VaaiColors} from '../theme';
import {VaaiBackground} from '../components/vaai-background';
import AsyncStorage from '@react-native-community/async-storage';
import {ClaimService} from '../services/claim-service';

const Tile = props => {
  return (
    <TouchableOpacity
      style={{marginBottom: 5}}
      onPress={() => {
        if (props.onPress != null) {
          props.onPress();
        }
      }}>
      <View style={{backgroundColor: props.color, height: 200}}>
        <VaaiBackground noCentre={props.noCentre} />
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            resizeMode="contain"
            source={props.image}
            style={{
              height: 90,
              maxWidth: '95%',
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const HomePage = props => {
  const {navigate} = props.navigation;
  const [pickup, setPickup] = useState(null);
  const [currentTowClaim, setCurrentTowClaim] = useState(null);
  const NOTIFICATION_CLAIM_INCOMPLETE = '1500';

  useEffect(() => {
    RoadsideService.currentPickup().subscribe(pickup => {
      setPickup(pickup);
    });

    ClaimService.isPendingTow().subscribe(claim => {
      console.log('Current pending tow');
      console.log(claim);
      setCurrentTowClaim(claim);
    });

    AsyncStorage.getItem('@askedLocation')
      .then(askedLocation => {
        console.log('gotResult');
        console.log(askedLocation);
        if (!askedLocation) {
          navigate('LocationRequired');
        }
      })
      .catch(err => {
        navigate('LocationRequired');
      });
  }, []);

  const goToPage = page => {
    UserService.uid().then(uid => {
      if (uid) {
        navigate(page);
      } else {
        Alert.alert('Hello', 'What do you want to do?', [
          {
            text: 'Login',
            onPress: () => {
              navigate('Login');
            },
          },
          {
            text: 'Register',
            onPress: () => {
              navigate('SignUp');
            },
          },
          {
            text: 'Nevermind',
          },
        ]);
      }
    });
  };

  const requestTow = () => {
    App.showLoading('Requesting Tow');
    return ClaimService.pickup(currentTowClaim)
      .then(() => {
        Alert.alert(
          'Driver on the way',
          "We've submitted your request and we'll send the nearest tow driver",
        );
      })
      .catch(err => {
        Alert.alert('Error', err.message);
      })
      .finally(() => {
        App.stopLoading();
      });
  };

  // setTimeout(() => {
  //     console.log('Settup notificaition')
  //     Notification.create({ subject: 'Hey', message: 'Yo! Hello world.' });
  // }, 3000)

  // RNLocalNotifications.createNotification(1, 'Some text', '2020-01-04 13:57', 'default');

  PushNotification.configure({
    onRegister: function(token) {
      console.log('TOKEN:', token);
    },
    onNotification: notification => {
      console.log('NOTIFICATION:', notification);

      setTimeout(() => {
        if (notification.id == NOTIFICATION_CLAIM_INCOMPLETE) {
          navigate('Claim');
        } else {
          navigate('Policies');
        }
      }, 1000);

      // required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
      // notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
  });

  // PushNotification.localNotificationSchedule({
  //     title: "Scheduled Notification",
  //       message: "My Notification Message",
  //       playSound: true,
  //       soundName: 'default',
  //       ongoing: true,
  //       autoCancel: false,
  //         date: moment().add(5, 'seconds').toDate()
  // })
  // console.log('Notification set')

  UserService.uid().then(uid => {
    if (uid) {
      return PolicyService.policies().then(policies => {
        const now = moment().format('YYYY-MM-DD HH:mm:ss');

        // console.log('Cancelling notifications')

        PushNotification.cancelAllLocalNotifications();
        policies.forEach(policy => {
          // console.log('Now: ' + now)
          // console.log('Effective Date: ' + policy.effective_date)
          if ((now < policy.effective_date) && !policy.picturesTaken) {
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
              id: NOTIFICATION_CLAIM_INCOMPLETE,
              ongoing: true,
              vibrate: false,
              visibility: false,
              userInfo: {
                id: NOTIFICATION_CLAIM_INCOMPLETE,
              },
            });
          }
        });
      });
    }
  });

  return (
    <Container style={{backgroundColor: 'white'}}>
      <Content contentContainerStyle={{padding: 10}}>
        <Tile
          noCentre={true}
          color={VaaiColors.blue}
          image={require('../assets/imgs/buycover.png')}
          onPress={() => goToPage('BuyVehicleCover')}>
          Buy Cover
        </Tile>
        <Tile
          noCentre={true}
          color={VaaiColors.homeGreen}
          image={require('../assets/imgs/claim.png')}
          onPress={() => goToPage('Claim')}>
          Claims
        </Tile>
        <Tile
          color={VaaiColors.orange}
          image={require('../assets/imgs/roadside.png')}
          onPress={() => goToPage('Roadside')}>
          Roadside
        </Tile>
      </Content>
      {pickup && (
        <Fab
          style={{backgroundColor: 'white'}}
          onPress={() => {
            navigate('ViewDriver', {
              pickup: pickup,
            });
          }}>
          <Icon name="car" style={{color: 'black'}} />
        </Fab>
      )}

      {currentTowClaim && (
        <View
          style={{
            padding: 10,
            position: 'absolute',
            bottom: 0,
            left: 10,
            right: 10,
          }}>
          <Button block light onPress={requestTow}>
            <Text>Request Tow Now</Text>
          </Button>
        </View>
      )}
    </Container>
  );
};

HomePage.navigationOptions = ({navigation}) => {
  const {openDrawer} = navigation;
  return {
    title: 'Vaai',
    header: () => {
      return (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Button
            transparent
            onPress={() => {
              openDrawer();
            }}>
            <Icon
              style={{color: VaaiColors.purple, fontSize: 30}}
              name="menu"
            />
          </Button>
          <View style={{flex: 1}}>
            <Image
              style={{
                width: 150,
                height: 80,
              }}
              source={require('../assets/imgs/logo.png')}
            />
          </View>
          {/* <Button transparent onPress={() => {
                        
                    }}>
                        <Icon style={{color: VaaiColors.purple, fontSize: 30}} name='bluetooth' />
                    </Button> */}
        </View>
      );
    },
    headerLeft: () => {
      return (
        <Button
          transparent
          onPress={() => {
            openDrawer();
          }}>
          <Icon style={{color: 'white'}} name="menu" />
        </Button>
      );
    },
    headerRight: () => {
      return (
        <Button
          transparent
          onPress={() => {
            // App.showLoading('Simulating...')
            // UserService.uid().then(uid => {
            //     if (uid) {
            //         return UserService.simulateAccident()
            //     } else {
            //         throw { message: 'You need to be logged in before running a simulation' }
            //     }
            // }).then(() => {
            //     Alert.alert('Complete', 'Simulation Complete')
            // })
            // .catch(err => {
            //     console.log(err)
            //     Alert.alert('Error', err.message)
            // }).finally(() => {
            //     App.stopLoading()
            // })
          }}>
          <Icon style={{color: 'black'}} name="bluetooth" />
        </Button>
      );
    },
  };
};
