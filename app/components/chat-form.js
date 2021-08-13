import React, {useState, useEffect, useRef} from 'react';
import {
  Content,
  View,
  Container,
  Text,
  Input,
  Item,
  Icon,
  Picker,
} from 'native-base';
import {Formik} from 'formik';
import {
  TouchableOpacity,
  PermissionsAndroid,
  Image,
  Linking,
  Alert,
} from 'react-native';
import * as Yup from 'yup';
import moment from 'moment';
import App from '../../App';
import HTML from 'react-native-render-html';
import {LocationService} from '../services/location-service';
import OpenAppSettings from 'react-native-app-settings';
import {CustomTimePicker} from './custom-time-picker';
import {CustomDatePicker} from './custom-date-picker';
import {VaaiBackground} from './vaai-background';

export const ChatBubble = ({
  chatBubbleColor,
  received,
  children,
  isImage,
  image,
  uri,
}) => {
  if (isImage) {
  }

  return (
    <View
      style={{
        paddingBottom: 10,
        alignItems: received ? 'flex-start' : 'flex-end',
      }}>
      <View
        style={{
          backgroundColor: received ? chatBubbleColor : 'white',
          borderWidth: received ? 0 : 1,
          borderColor: chatBubbleColor,
          padding: 10,
          borderRadius: 10,
          borderTopLeftRadius: received ? 0 : 10,
          borderBottomRightRadius: received ? 10 : 0,
          maxWidth: 250,
          // marginRight: received ? 60 : 0,
          // marginLeft: received ? 0 : 60
        }}>
        {isImage ? (
          <>
            <Image
              source={uri ? {uri: uri} : image}
              resizeMode="cover"
              style={{width: 200, height: 200}}
            />
            {children && (
              <HTML
                onLinkPress={(event, href) => {
                  Linking.openURL(href);
                }}
                html={`<div style="color: ${
                  received ? 'white' : chatBubbleColor
                }">${children}</div>`}
                imagesMaxWidth={230}
              />
            )}
          </>
        ) : (
          <HTML
            onLinkPress={(event, href) => {
              Linking.openURL(href);
            }}
            html={`<div style="color: ${
              received ? 'white' : chatBubbleColor
            }">${children}</div>`}
            imagesMaxWidth={230}
          />
        )}
      </View>
    </View>
  );
};

export const ChatForm = ({
  chatBubbleColor = 'black',
  backgroundColor = 'white',
  form,
  onValue,
  onAction,
  onDropdownList,
  navigation,
  onAfterMessage,
  prevForm,
  onCurrentMessage,
}) => {
  let content;
  let globalHandleChange;
  const {navigate} = navigation;
  const [messages, setMessages] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [initialized, setInit] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [dropdownList, setDropdownList] = useState([]);
  const inputStyle = {paddingLeft: 20, paddingRight: 20};

  const schema = Yup.object().shape({
    text: Yup.string()
      .trim()
      .required(),
  });

  const locationSelected = location => {
    const link =
      `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${
        location.lng
      }&zoom=17&size=600x300&maptype=roadmap` +
      `&markers=color:red%7Clabel:L%7C${location.lat},${location.lng}` +
      '&key=AIzaSyBCnCPfmBgplyJw3fsk1bVzZIKaNZYCwSg';

    const result = onValue(currentMessage.key, {
      location: location,
      link: link,
    });
    sendImage(result.link, false);
  };

  const pictureTaken = data => {
    const result = onValue(currentMessage.key, data.uri);
    sendImage(result, false);
  };

  const licenseDiskScanned = licenseDisk => {
    const result = onValue(currentMessage.key, licenseDisk);
    sendMessage(result, true);
    nextMessage(currentMessage.next);
  };

  const scanLicenseDisk = () => {
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA).then(
      hasPermission => {
        if (!hasPermission) {
          requestCameraPermission();
        } else {
          navigate('ScanLicenseDisk', {
            callback: licenseDiskScanned,
          });
        }
      },
    );
  };

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Vaai Requires Camera Permission',
          message: 'Vaai needs access to your camera to scan the license disk',
          buttonNegative: 'Cancel',
          buttonPositive: 'Ok',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        navigate('ScanLicenseDisk', {
          callback: licenseDiskScanned,
        });
      } else {
        this.props.navigation.goBack();
      }
    } catch (err) {}
  };

  const start = () => {
    nextMessage(form['start']);
  };

  const nextMessage = key => {
    const message = form[key];

    if (message == null) return;

    setCurrentMessage({
      ...message,
      key: key,
    });

    if (message.type == 'action') {
      if (onAction != null) {
        onAction(key, {sendMessage, nextMessage, sendImage});
      }
    } else {
      sendMessage(message.content, true, App.images[message.image]);
    }

    if (message.fieldType == 'dropdown') {
      const dropdownResult = onDropdownList(key, {sendMessage, nextMessage});

      if (dropdownResult instanceof Promise) {
        App.showLoading('Loading list');
        dropdownResult
          .then(dropdown => {
            setDropdownList(dropdown);
          })
          .finally(() => {
            App.stopLoading();
          });
      } else {
        setDropdownList(dropdownResult);
      }
    }
  };

  const sendMessage = (text, received = false, image) => {
    setMessages(oldMessages => {
      const message = {
        text: text,
        received: received,
        image,
      };
      const newMessages = oldMessages.concat([message]);

      if (onAfterMessage != null) {
        onAfterMessage({message, currentMessage});
      }

      return newMessages;
    });
  };

  const sendImage = (text, received = false) => {
    setMessages(oldMessages => {
      const message = {
        // text: text,
        received: received,
        uri: text,
      };
      if (onAfterMessage != null) {
        onAfterMessage({message, currentMessage});
      }

      return oldMessages.concat([message]);
    });
  };

  const send = (values, handleReset) => {
    if (onValue != null) {
      const value = values.text;
      handleReset();
      switch (currentMessage.fieldType) {
        case 'text':
        case 'number':
        case 'phone':
        case 'time':
        case 'date':
          const result = onValue(currentMessage.key, value);
          if (value.trim().length > 0) {
            sendMessage(result, false);
          }

          break;
        case 'licenseDisk':
          scanLicenseDisk();
          break;
        case 'camera':
          navigate('Camera', {
            callback: pictureTaken,
          });
          break;
        case 'fab':
          onAction(currentMessage.key, {
            sendMessage,
            nextMessage,
            sendImage,
            onValue,
          });
          break;
        case 'location':
          LocationService.requestPermissions()
            .then(() => {
              navigate('Location', {
                callback: locationSelected,
              });
            })
            .catch(err => {
              Alert.alert('Error', err.message, [
                {
                  text: 'Location Settings',
                  onPress: () => {
                    OpenAppSettings.open();
                  },
                },
                {
                  text: 'Cancel',
                },
              ]);
            });
          break;
        case 'dropdown':
          const newValue = dropdownList[parseInt(value)];
          const result2 = onValue(currentMessage.key, newValue);
          sendMessage(result2, false);
          setDropdownList([]);
          break;
      }

      // handleReset()
    }
  };

  useEffect(() => {
    if (onCurrentMessage != null) {
      onCurrentMessage(currentMessage);
    }

    if (currentMessage) {
      switch (currentMessage.type) {
        case 'message':
          if (currentMessage.next) {
            nextMessage(currentMessage.next);
          }
          break;
      }
    }
  }, [currentMessage]);

  useEffect(() => {
    if (messages.length > 0) {
      if (
        messages[messages.length - 1].received == false &&
        currentMessage.next
      ) {
        nextMessage(currentMessage.next);
      }
    }

    setTimeout(() => {
      if (content && content._root) {
        content._root.scrollToEnd();
      }
    }, 300);

    // if (currentMessage != null) {
    //     switch (currentMessage.type) {
    //         case 'message':
    //             if (currentMessage.next) {
    //                 nextMessage(currentMessage.next)
    //             }
    //             break
    //     }
    // }
  }, [messages]);

  useEffect(() => {
    if (dropdownList && dropdownList.length > 0) {
      globalHandleChange('text')('0');
    }
  }, [dropdownList]);

  useEffect(() => {
    if (initialized == false) {
      setInit(true);

      if (prevForm != null && prevForm.currentMessage) {
        setMessages(prevForm.messages);
        setCurrentMessage(prevForm.currentMessage);
      } else {
        start();
      }
    }
  }, []);

  return (
    <Container style={{backgroundColor: backgroundColor}}>
      <VaaiBackground showTop={false} />
      <Content
        style={{flex: 1, padding: 10}}
        ref={c => {
          if (c) {
            content = c;
          }
        }}>
        {messages.map((message, index) => {
          return (
            <ChatBubble
              uri={message.uri}
              chatBubbleColor={chatBubbleColor}
              isImage={message.image != null || message.uri != null}
              image={message.image}
              key={index}
              received={message.received}>
              {message.text}
            </ChatBubble>
          );
        })}
        {currentMessage && (
          <View
            style={{
              paddingBottom: 20,
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              flexDirection: 'row',
            }}>
            {currentMessage.type == 'options' &&
              currentMessage.options.map((option, index) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      const result = onValue(currentMessage.key, option.text);
                      sendMessage(result);
                      nextMessage(option.next);
                    }}
                    key={index}
                    style={{marginRight: 5, marginBottom: 5}}>
                    <View
                      style={{
                        borderWidth: 2,
                        borderColor: chatBubbleColor,
                        borderRadius: 20,
                        padding: 5,
                        paddingLeft: 15,
                        paddingRight: 15,
                        minWidth: 60,
                      }}>
                      <Text style={{color: chatBubbleColor}}>
                        {option.text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
          </View>
        )}
      </Content>
      <View
        style={{
          backgroundColor: 'white',
          height: 50,
          padding: 10,
          marginBottom: 20,
          backgroundColor: backgroundColor,
        }}>
        <Formik
          enableReinitialize={true}
          onSubmit={(values, helpers) => send(values, helpers.resetForm)}
          initialValues={{text: currentText}}>
          {({
            values,
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
          }) => {
            globalHandleChange = handleChange;
            return (
              <View style={{flexDirection: 'row'}}>
                {currentMessage &&
                ['text', 'date', 'dropdown', 'number', 'phone', 'time'].indexOf(
                  currentMessage.fieldType,
                ) > -1 ? (
                  <View
                    style={{
                      borderTopRightRadius: 60,
                      borderBottomRightRadius: 60,
                      borderTopLeftRadius: 60,
                      borderBottomLeftRadius: 60,
                      backgroundColor: '#efefef',
                      flex: 1,
                      borderColor: 'transparent',
                      marginRight: 10,
                      justifyContent: 'center',
                    }}>
                    {currentMessage.fieldType == 'text' && (
                      <Input
                        value={values.text}
                        onBlur={handleBlur('text')}
                        onChangeText={handleChange('text')}
                        style={inputStyle}
                        placeholder="Input Text"
                        placeholderTextColor="#c0c0c0"
                      />
                    )}
                    {currentMessage.fieldType == 'phone' && (
                      <Input
                        keyboardType="phone-pad"
                        value={values.text}
                        onBlur={handleBlur('text')}
                        onChangeText={handleChange('text')}
                        style={inputStyle}
                        placeholder="Input Text"
                        placeholderTextColor="#c0c0c0"
                      />
                    )}
                    {currentMessage.fieldType == 'number' && (
                      <Input
                        keyboardType="decimal-pad"
                        value={values.text}
                        onBlur={handleBlur('text')}
                        onChangeText={handleChange('text')}
                        style={inputStyle}
                        placeholder="Input Text"
                        placeholderTextColor="#c0c0c0"
                      />
                    )}
                    {currentMessage.fieldType == 'time' && (
                      <CustomTimePicker
                        value={values.text}
                        onChangeTime={time => {
                          handleChange('text')(time);
                        }}
                      />
                    )}
                    {currentMessage.fieldType == 'date' && (
                      <CustomDatePicker
                        minimumDate={new Date()}
                        maximumDate={moment()
                          .add(2, 'months')
                          .toDate()}
                        onChangeDate={date => {
                          handleChange('text')(date);
                        }}
                      />
                    )}
                    {currentMessage.fieldType == 'dropdown' && (
                      <Picker
                        selectedValue={values.text}
                        onValueChange={value => {
                          setFieldValue('text', value);
                        }}>
                        {dropdownList &&
                          dropdownList.map((item, index) => {
                            return (
                              <Picker.Item
                                key={index}
                                label={item.name}
                                value={`${index}`}
                              />
                            );
                          })}
                      </Picker>
                    )}
                  </View>
                ) : (
                  <View style={{flex: 1}} />
                )}

                {currentMessage && currentMessage.type == 'question' && (
                  <TouchableOpacity
                    onPress={() => {
                      handleSubmit();
                    }}>
                    <View
                      style={{
                        backgroundColor: chatBubbleColor,
                        width: 50,
                        height: 50,
                        borderRadius: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {(currentMessage.fieldType == 'text' ||
                        currentMessage.fieldType == 'date' ||
                        currentMessage.fieldType == 'time' ||
                        currentMessage.fieldType == 'dropdown' ||
                        currentMessage.fieldType == 'number' ||
                        currentMessage.fieldType == 'phone') && (
                        <Icon
                          name="send"
                          style={{color: 'white', fontSize: 20}}
                        />
                      )}
                      {currentMessage.fieldType == 'licenseDisk' && (
                        <Icon
                          name="scan1"
                          style={{color: 'white', fontSize: 20}}
                          type="AntDesign"
                        />
                      )}
                      {currentMessage.fieldType == 'camera' && (
                        <Icon
                          name="camera"
                          style={{color: 'white', fontSize: 20}}
                        />
                      )}
                      {(currentMessage.fieldType == 'location' ||
                        currentMessage.fieldType == 'friend-location') && (
                        <Icon
                          name="pin"
                          style={{color: 'white', fontSize: 20}}
                        />
                      )}
                      {currentMessage.fieldType == 'fab' && (
                        <Icon
                          name={currentMessage.icon}
                          style={{color: 'white', fontSize: 20}}
                        />
                      )}
                      {/* {(currentMessage.fieldType == 'time') && <Icon name='time' style={{color: 'white', fontSize: 20}} />} */}
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        </Formik>
      </View>
    </Container>
  );
};
