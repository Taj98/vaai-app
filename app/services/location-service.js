import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native'
import Axios from 'axios';

export const GOOGLE_MAP_KEY = "AIzaSyDy8l2MmrOl-EKprQ0Li5pwlSWXIjRosLE"

export class LocationService {
    static async requestPermissions() {
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
            title: 'Vaai location permission',
            message: 'Vaai requires access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK'
        })

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            throw({
                message: "We won't be able to retrieve your location until you enable your location"
            })
        }
    }

    static addresses(address, session) {
        address = address.split(' ').join('+')
        return Axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${address}&key=AIzaSyDmNMFP52aMA6iqhaQcTfUIww_c4BB-ELs&sessiontoken=` + session).then(res => {
            return res.data.predictions
        })
    }

    static geocode(address) {
        return Axios.get('https://maps.googleapis.com/maps/api/geocode/json?address=' +
        address.split(' ').join('+') + '&key=' + GOOGLE_MAP_KEY).then(res => {
            const x = res.data.results[0]
            
            const item = {
                address: x['formatted_address'],
                location: x['geometry']['location']
            }

            return item
        })
    }

    static getCurrentPosition() {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(location => {
                resolve(location)
            }, err => {
                reject(err)
            }, {
                distanceFilter: 50,
                enableHighAccuracy: true,
                maximumAge: 10000,
                forceRequestLocation: true,
                timeout: 10000
            })
        })
    }
}