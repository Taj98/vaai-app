import React from 'react'
import {Text, View} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import { Root, Spinner, Fab, Icon } from 'native-base';
import AppNavigator from './AppNavigator';
import { createStore , compose, applyMiddleware} from 'redux';
import { composeWithDevTools } from 'remote-redux-devtools';
import reducers from './app/redux/reducers'
import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux';
import { requestConnectDevice, pairedWithDeviceSuccess } from './app/redux/obd-device/obd-device-action';
import OBDService from './app/obd-service';

export default class App extends React.Component {
  store
  static currentSong = null
  static currentApp
  static showLoading(message) {
    console.log('Show loading ' + message)

    if (App.currentApp)
      App.currentApp.setState({
        loading: true,
        message: message
      })
  }
  static images = {
    left: require('./app/assets/imgs/left.png'),
    right: require('./app/assets/imgs/right.png'),
    front: require('./app/assets/imgs/front.png'),
    back: require('./app/assets/imgs/back.png'),
    odometer: require('./app/assets/imgs/odometer.png'),
    dashboard: require('./app/assets/imgs/dashboard.jpg')
  }

  static stopLoading() {
    console.log('Stop loading')
    if (App.currentApp)
      App.currentApp.setState({
        loading: false,
        message: null
      })
  }

  state = {
    loading: false,
    message: null
  }
  navigation

  constructor(props) {
    super(props)

    App.currentApp = this

    const composeEnhancers = composeWithDevTools({ realtime: true, hostname: '192.168.122.1', port: 8000 });
  // const composeEnhancers = compose(devTools({ suppressConnectErrors: false, realtime: true, secure: false, hostname: '192.168.8.105', port: 8000 }))
    this.store =  createStore(reducers, {}, composeEnhancers(applyMiddleware(
      thunkMiddleware
    )))
  }

  componentDidMount() {
    AsyncStorage.getItem('obdDeviceId').then(id => {
      if (id) {
        this.store.dispatch(requestConnectDevice(id))
      }
    })

    console.log('Getting paired devices')
    OBDService.pairedDevices(err => {}, devices => {
      for (let i = 0; i < devices.length; i++) {
        const device = devices[i]
        if (device.name && (device.name.toLowerCase().indexOf('vlink') != -1 || device.name.toLowerCase().indexOf('v-link') != -1)) {
          this.store.dispatch(pairedWithDeviceSuccess(device))
          return
        }
      }
      
      // console.log(devices)
    })
  }

  render() {
    return (
      // <View><Text>Hey</Text></View>
      <Root>
        <Provider store={this.store}>
          <AppNavigator />
          
          {this.state.loading && <View style={{
            position: 'absolute',
            zIndex: 10000,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 8,
              minWidth: 250,
              maxWidth: 250,
              padding: 20
            }}>
              <Text style={{textAlign: 'center'}}>{this.state.message ? this.state.message : 'Please wait'}</Text>
              <Spinner color='black' style={{marginTop: 10}} />
            </View>
          </View>}
        </Provider>
      </Root>
    )
  }
}