/* eslint-disable radix */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {Container, View, Spinner, Text, Icon, Button} from 'native-base';
import * as form from '../../assets/forms/buy-cover/vehicle.json';
import {ChatForm} from '../../components/chat-form.js';
import moment from 'moment';
import {EngineService} from '../../services/engine-service.js';
import {FormService} from '../../services/form-service.js';
import {Alert} from 'react-native';
import PushNotification from 'react-native-push-notification';
import {CustomHeader} from '../../components/custom-header.js';
import {VaaiColors} from '../../theme.js';
import {UserService} from '../../services/user-service';

export const BuyVehicleCoverPage = ({navigation}) => {
  const [formValues, setFormValue] = useState({});
  const [startDate, setStartDate] = useState(null)
  const [prevForm, setPrevForm] = useState({
    loaded: false,
    form: null,
  });
  const [makes, setMakes] = useState(null);
  const [subscriptionType, setSubType] = useState(null);

  // let formValues = {}

  useEffect(() => {
    // EngineService.vehicles.makes().then(makes => {
    setMakes(makes);
    setPrevForm({
      loaded: true,
      //     form: form
    });
    // return FormService.form('buy-cover').then(form => {

    //     // setPrevForm({
    //     //     loaded: true,
    //     //     form: form
    //     // })
    //     // setFormValue(form ? form.formValues : {})

    // })
    // })
  }, [makes]);

  const onDropdownList = key => {
    switch (key) {
      case 'days':
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => {
          return {
            name: `${day}`,
            value: `${day}`,
          };
        });
      case 'tooMuch':
        return EngineService.tooMuch(formValues.quoteId).then(options => {
          return options.map(option => {
            return {
              name:
                'R' +
                numberDisplay(
                  (
                    parseInt(option.premium) /
                      parseFloat(formValues.days?.value) || 30
                  ).toFixed(0),
                ) +
                ' per day (R' +
                numberDisplay(option.sum_insured) +
                ' cover per day)',
              value: option.premium,
              sum_insured: parseInt(option.sum_insured),
              premium: option.premium,
            };
          });
        });
      case 'model':
        return EngineService.vehicles
          .models(makes[formValues.scan.make])
          .then(models => {
            return models.map(model => {
              return {
                name: model.model,
                value: model.model_code,
              };
            });
          });
      case 'variant':
        const make = makes[formValues.scan.make];
        console.log(formValues.model);
        return EngineService.vehicles
          .variants(make, formValues.model.value)
          .then(variants => {
            return variants.map(variant => {
              return {
                name: variant.variant,
                value: variant.mmcode,
              };
            });
          });
      case 'year':
        return EngineService.vehicles
          .years(formValues.variant.value)
          .then(years => {
            return years.map(year => {
              return {
                name: `${year.reg_year}`,
                value: year.mmcode,
              };
            });
          });
    }
  };

  const onAfterMessage = ({message}) => {
    FormService.add(message, 'buy-cover', formValues);
  };

  const onCurrentMessage = currentMessage => {
    FormService.setCurrentMessage(currentMessage, 'buy-cover');
  };

  const onAction = (key, helpers) => {
    console.log('On action: ' + key);
    switch (key) {
      case 'calculateCost':
        calculateCost(helpers);
        break;
      case 'checkPolicyWording': {
        checkPolicyWording(helpers);
        break;
      }
      case 'validateTime': {
        const timeNow = moment(Date.now())
          .add(10, 'minutes')
          .format('YYYY-MM-DD HH:mm');
        const timeChosen = formValues.startTime;
        const dateChosen = formValues.startDate ?? formValues.startMonthly;
        console.log(timeNow, dateChosen + ' ' + timeChosen);
        if (timeNow >= dateChosen + ' ' + timeChosen) {
          helpers.sendMessage(
            'Please select a time that is at least 10MIN from now.',
            true,
          );
          helpers.nextMessage('startTime');
        } else {
          if (formValues.startMonthly) {
            helpers.nextMessage('scan');
          } else {
            helpers.nextMessage('days');
          }
        }
        break;
      }
      case 'payment': {
        payment(helpers);
        break;
      }
      case 'cash_payment': {
        cashPayment(helpers);
        break;
      }
      case 'checkExpiry': {
        console.log('Checking expiry');
        console.log(formValues.scan.licenseDiskExp);
        console.log(formValues.startDate);
        /* @TODO: uncomment when expiration check needs to be added in again */
        // if (formValues['scan'].licenseDiskExp < formValues['startDate']) {
        //     helpers.nextMessage('scan')
        // } else {
        helpers.nextMessage('calculateCost');
        // }
      }
    }
  };

  const paymentSuccessful = (paid, {sendMessage}) => {
    if (paid) {
      // const endDate = moment(`${formValues['startDate']} ${formValues['startTime']}:00`).add(formValues['days'].value, 'days')
      sendMessage('Awesome, you have made the smart choice. 🎉', true);
      sendMessage(
        'For the daily product please make sure this phone & the data logger are connected. For the 30 day, data logger is optional.',
        true,
      );
      sendMessage(
        'Buy it for R350 on our website <a href="https://vaai.co/product/datalogger/">www.vaai.co</a>.',
        true,
      );

      // sendMessage(`Your cover will start on ${formValues['startDate']} at ${formValues['startTime']} and end on ${endDate.format('YYYY-MM-DD')} at ${endDate.format('HH:mm')}`, true)
      // sendMessage('You will get a notification with instructions on taking pictures of your vehicle soon as your cover starts', true)
      sendMessage(
        'You must do an inspection of the car using the Vaai.co app on the date & time selected to activate your cover.',
        true,
      );
      sendMessage('Sharp! 👍', true);
      sendMessage('Heva nice life, you got no stress baby 😎', true);
      console.log({m1: moment(startDate).toDate(), m2: moment(`${formValues['startDate']} ${formValues['startTime']}:00`).toDate()})

      PushNotification.localNotificationSchedule({
        message: 'Please take pictures of your car',
        title: 'Urgent! Car Inspection Due',
        date: moment(startDate).toDate(),
        soundName: 'default',
        autoCancel: false,
        ongoing: true,
      });

      setTimeout(() => {
        FormService.remove('buy-cover');
      }, 2000);

      // subscription.unsubscribe()
      // navigation.goBack()
    }
  };

  const checkPolicyWording = ({sendMessage, nextMessage}) => {
    if (subscriptionType === 'monthly') {
      sendMessage(
        "<a style='color: white' href='https://vaai.co/wp-content/uploads/2021/05/VAAI-FS-30-Day-Policy-Wording.pdf'>Policy Wording 📄</a>",
        true,
      );
    } else {
      sendMessage(
        "<a style='color: white' href='https://vaai.co/policy-wording/'>Policy Wording 📄</a>",
        true,
      );
    }
    nextMessage('proceed2');
  };

  const payment = ({sendMessage}) => {
    // const subscription = PaymentService.listenForPayment(formValues.quoteId).subscribe((paid) => {
    //     console.log('Paid: ' + paid)

    // })

    const paymentTypes = {
      // 'Deposit Cash at Shoprite/Checkers': 'sc',
      'Cheque/Credit Card': 'cc',
      // 'Instant EFT': 'eft'
    };

    navigation.navigate('Payment', {
      quoteId: formValues.quoteId,
      paymentType: paymentTypes[formValues.payment_method],
      amount: parseInt(formValues.premiumAmount),
      callback: paid => {
        paymentSuccessful(paid, {sendMessage});
      },
    });
  };

  const cashPayment = ({sendMessage}) => {
    sendMessage('Awesome, you have made the smart choice. 🎉', true);
    sendMessage(
      `Your policy will be available as soon as you deposit <b><u>R${
        formValues.premiumAmount
      }</u></b> @ an FNB ATM. Use the <b><u>VAAI${
        formValues.quoteId
      }</u></b> as your reference number.`,
      true,
    );
    // sendMessage(`Account Details<br/>Bank: FNB<br/>Account Number: 61236845624<br/>Branch Code: 250 655<br/>Reference: VAAI${formValues.quoteId}`, true)
    sendMessage(
      'Remember, you must have a Bluetooth data logger installed in your car.',
      true,
    );
    sendMessage(
      'Buy it for R350 on our website <a href="https://www.vaai.co">www.vaai.co</a>.',
      true,
    );

    // sendMessage(`Your cover will start on ${formValues['startDate']} at ${formValues['startTime']} and end on ${endDate.format('YYYY-MM-DD')} at ${endDate.format('HH:mm')}`, true)
    // sendMessage('You will get a notification with instructions on taking pictures of your vehicle soon as your cover starts', true)
    sendMessage(
      'You must do an inspection of the car using the Vaai.co app on the date & time selected to activate your cover.',
      true,
    );
    sendMessage('Sharp! 👍', true);
    sendMessage('Heva nice life, you got no stress baby 😎', true);
  };

  const numberDisplay = value => {
    return parseFloat(value)
      .toFixed()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const calculateCost = ({sendMessage, nextMessage}) => {
    console.log('Calculate cost: ', formValues);
    sendMessage(
      'Let me see how much that will be, based on the number of days selected. Chilla for a few seconds.',
      true,
    );
    let sub_type = 'daily';
    let start = formValues.startDate + ' ' + formValues.startTime + ':00';
    if (!formValues.days) {
      sub_type = 'monthly';
      setSubType(sub_type);
      start = formValues.startMonthly + ' ' + formValues.startTime + ':00';
    }

    setStartDate(start)
    const days = parseInt(formValues.days?.value) || 30;
    const end = moment(start)
      .add(days, 'days')
      .format('YYYY-MM-DD HH:mm:ss');
    let price = 0;
    let monthly_premium = 0;
    let notFound = false;

    EngineService.calculateCostByVIN(
      formValues.scan.vin,
      sub_type === 'monthly' ? 17 : undefined,
    )
      .then(result => {
        price = result.value;
        monthly_premium = result.monthly_premium;
        if (result.year === 0 || result.value === 0) {
          notFound = true;
          price = 30000;
        }

        if (formValues.tooMuch) {
          result = {
            ...result,
            value: formValues.tooMuch.sum_insured,
            daily_premium: parseInt(formValues.tooMuch.premium) / days,
          };
        } else {
          result = {
            ...result,
            [sub_type !== 'monthly' ? 'daily_premium' : 'monthly_premium']:
              sub_type !== 'monthly'
                ? result.daily_premium > result.max_premium
                  ? result.max_premium
                  : result.daily_premium
                : result.monthly_premium > result.max_premium
                ? result.max_premium
                : result.monthly_premium,
          };
        }

        return UserService.profile().then(profile => {
          return EngineService.quote({
            inception_date: start,
            subscription_type: sub_type,
            anniversary_date: end,
            policybuilder_id: 17,
            premium:
              sub_type === 'monthly'
                ? result.monthly_premium * (parseInt(formValues.days?.value) / 30 || 1)
                : result.daily_premium * (parseInt(formValues.days?.value) || 30),
            sum_insured:
              result.year === 0 || result.value === 0
                ? 30000
                : result.value > result.max_sum_insured
                ? 120000
                : result.value,
            data: {
              vehicle_year: result.year === 0 ? '2009' : `${result.year}`,
              vehicle_registration: formValues.scan.licensePlate,
              vin_number: formValues.scan.vin,
              pictures: {
                license: `${profile.licensePicture}&type=.png`,
              },
              variant: result.variant,
              value: result.value,
              make: result.make,
              model: result.model,
              year: result.year,
              policybuilder_id: 17,
            },
            owner:
              formValues.owner === 'Yes'
                ? null
                : {
                    // not handled by Engine API. Owner is NULL when logged in user is the owner of the vehicle
                    name: formValues.ownerName,
                    phone: formValues.ownerPhoneNumber,
                  },
          });
        });
      })
      .then(quote => {
        setFormValue(values => {
          values.coverAmountRands = quote.sum_insured;
          values.quoteId = quote.policy_id;
          values.premiumAmount = parseFloat(quote.premium);

          FormService.setValues(values, 'buy-cover');

          return values;
        });

        if (price > 120000) {
          // is the maximum we will pay for repairs or if your car is a write-off
          if (!formValues.tooMuch) {
            // sendMessage(`Your vehicle is worth R${numberDisplay(price)}. We can only insure it at a max amount of R120 000`, true)
            sendMessage(
              'Your vehicle is worth more than R120 000. We can only insure it at a max amount of R120 000',
              true,
            );
          } else if (notFound) {
            sendMessage(
              'We could not find your vehicle in our database. We can only insure it at a max amount of R30 000',
              true,
            );
          }
        }

        sendMessage(
          // "Your car is worth R" + quote.sum_insured + '. It will cost R' + quote.premium + ' to cover your car for the ' + days + ' day' + (days > 1 ? 's' : '') + ' selected. ', true
          'The cost of your cover for ' +
            days +
            ' day' +
            (days > 1 ? 's' : '') +
            ' is going to be R' +
            numberDisplay(parseInt(quote.premium)) +
            `. R${numberDisplay(
              quote.sum_insured,
            )} is the maximum we will pay for repairs or if your car is a write-off`,
          true,
        );

        if (sub_type === 'monthly') {
          nextMessage('almostDone');
        } else {
          nextMessage('proceed1');
        }
      })
      .catch(err => {
        console.log(err);
      });
    // VehicleService.vehicle(formValues['scan']['make'], formValues['model'].value, formValues['variant'].value, formValues['year'].value)
    //   .then((vehicle) => {

    // })
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
          onDropdownList={onDropdownList}
          onValue={(key, value) => {
            console.log(value);
            console.log('On Value');

            setFormValue(values => {
              if (values) {
                values[key] = value;
              }

              return values;
            });
            if (key === 'scan') {
              /* @TODO: uncomment when expiration check needs to be added in again */
              // if (value.licenseDiskExp < formValues['startDate']) {
              //     return `Your license disk will not be valid on the day your cover starts. Please try again with a renewed and valid license disk`
              // } else {
              return `Your car is a ${value.make}. Good choice. 👍🏽`;
              // }
            } else if (key === 'model') {
              return value.name;
            } else if (key === 'variant') {
              return value.name;
            } else if (key === 'year') {
              return value.name;
            } else if (key === 'days') {
              return value.name;
            } else if (key === 'tooMuch') {
              return value.name;
            }

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

BuyVehicleCoverPage.navigationOptions = ({navigation}) => {
  return {
    title: 'Buy Vehicle Cover',
    header: (
      <CustomHeader
        title="Buy Vehicle Cover"
        navigation={navigation}
        headerRight={
          <Button
            style={{display: 'none'}}
            transparent
            onPress={() => {
              Alert.alert(
                'Exit Session',
                'Are you sure you want to exit the session? You will lose all the information you have entered',
                [
                  {
                    text: 'Yes',
                    onPress: () => {
                      FormService.remove('buy-cover');
                      navigation.goBack();
                    },
                  },
                  {
                    text: 'No',
                  },
                ],
              );
            }}>
            <Icon style={{color: 'white'}} name="exit" />
          </Button>
        }
      />
    ),
  };
};
