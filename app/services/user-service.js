import firebase from "react-native-firebase";
import Axios from "axios";
import { Observable } from "rxjs";
import { EngineService } from "./engine-service";
import { PolicyService } from "./policy-service";
import { LocationService } from "./location-service";
import Geolocation from 'react-native-geolocation-service';
import moment from "moment";

export class UserService {
    static isLoggedIn() {
        return Observable.create(observer => {
            firebase.auth().onAuthStateChanged(user => {
                observer.next(user)
            })
        })
    }

    static updatePhoneNumber(phone) {
        if (phone[0] == '+') {
            phone = phone.substr(1, phone.length)
        }

        if (phone[0] == '0') {
            phone = '27' + phone.substr(1, phone.length)
        }

        return new Promise((resolve) => {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    resolve(user)
                } else {
                    resolve(null)
                }
            })
        }).then(user => {
            return user.updateEmail(`${phone}@okgolive.com`).then(() => {
                return firebase.firestore().collection('users').doc(user.uid).update({
                    phone: phone
                })
            })
        })
        
    }

    static login(phone, password) {
        return firebase.auth().signInWithEmailAndPassword(`${phone}@okgolive.com`, password).then(user => {
            return UserService.profile(user.user.uid)
        })
    }

    static logout() {
        return firebase.auth().signOut()
    }

    static uid() {
        return new Promise((resolve) => {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    resolve(user.uid)
                } else {
                    resolve(null)
                }
            })
        })
    }

    static profile(uid) {
        if (uid == null) {
            return new Promise((resolve) => {
                UserService.isLoggedIn().subscribe(user => {
                    if (user) {
                        const uid = user.uid
                        return firebase.firestore().collection(`users`).doc(uid).get().then(snapshot => {
                            const data = snapshot.data()
                            resolve({
                                ...data,
                                uid: uid
                            })
                        })
                    } else {
                        return resolve(null)
                    }
                })
            })
        } else {
            return firebase.firestore().collection(`users`).doc(uid).get().then(snapshot => {
                const data = snapshot.data()

                return {
                    ...data,
                    uid: uid
                }
            })
        }
    }

    static addLog(uid, description) {
        return firebase.database().ref(`logs/${uid}`).push({
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            action: description
        })
    }

    static updateProfilePicture(file) {
        return UserService.uid().then(uid => {
            return firebase.storage().ref(`profilePictures/${uid}`).putFile(file).then(ref => {
                return firebase.storage().ref(`profilePictures/${uid}`).getDownloadURL().then(url => {
                    return firebase.firestore().collection(`users`).doc(uid).update({
                        profilePicture: url
                    }).then(() => {
                        return UserService.addLog(uid, 'Updated Profile Picture').then(() => {
                            return url
                        })
                    })
                })
            })
        })
    }

    static updateLicensePicture(file) {
        return UserService.uid().then(uid => {
            return firebase.storage().ref(`licensePictures/${uid}`).putFile(file).then(ref => {
                return firebase.storage().ref(`licensePictures/${uid}`).getDownloadURL().then(url => {
                    return firebase.firestore().collection(`users`).doc(uid).update({
                        licensePicture: url
                    }).then(() => {
                        return UserService.addLog(uid, 'Updated Profile Picture')
                    })
                })
            })
        })
    }

    static updateRegistrationLocation(location) {
        return UserService.uid().then(uid => {
            return firebase.firestore().collection(`users`).doc(uid).update({
                registrationLocation: location
            })
        })
    }

    static updateProfile(profile) {
        // delete profile.phone

        return this.updatePhoneNumber(profile.phone).then(() => {
            return UserService.uid().then(uid => {
                return firebase.firestore().collection(`users`).doc(uid).update(profile)
            })
        })
    }

    static signup(phone, password, profile) {
        console.log('Signing up')
        if (phone[0] == '0') {
            phone = '27' + phone.substr(1, phone.length)
        }
        return EngineService.createUser(profile).then(engineProfile => {
            profile.engineToken = engineProfile.users[0].api_token
            profile.engineId = engineProfile.id
            profile['phone'] = phone

            return firebase.auth().createUserWithEmailAndPassword(`${phone}@okgolive.com`, password).then(user => {
                return firebase.firestore().collection(`users`).doc(user.user.uid).set({
                    phone: phone,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    ...profile
                })
            })
        })
        
    }

    // static sendPasswordResetCode(phone) {
    //     return Axios.get('https://us-central1-ok-go-live.cloudfunctions.net/forgotPassword?phone='+phone).then(result => {
    //         return result.data
    //     }).catch(err => {
    //         console.log(err)
    //     })
    // }

    // static resetPassword(phone, code, password) {
    //     return Axios.get(`https://us-central1-ok-go-live.cloudfunctions.net/resetPassword?phone=${phone}&code=${code}&password=${password}`).then(result => {
    //         return result.data
    //     }).catch(err => {
    //         console.log(err)
    //     })
        
    //     // .pipe(map(result => {
    //     //     return result.json()
    //     // })).toPromise().catch(err => {
    //     //     console.log(err)
    //     // })
    // }

    // https://us-central1-ok-go-live.cloudfunctions.net/confirmPhoneNumber
    // https://us-central1-ok-go-live.cloudfunctions.net/verifyPhone

    static resetPassword(phone, code, password) {
        return Axios.get(`https://us-central1-ok-go-live.cloudfunctions.net/resetPassword?phone=${phone}&code=${code}&password=${password}`).then(res => {
            return res.data
        }).catch(err => {
            if (err.response && err.response.data) {
                throw err.response.data
            } else {
                throw err
            }
        })
    }

    static sendPasswordResetCode(phone) {
        return Axios.get(`https://us-central1-ok-go-live.cloudfunctions.net/forgotPassword?phone=${phone}`).then(res => {
            return res.data
        }).catch(err => {
            if (err.response && err.response.data) {
                throw err.response.data
            } else {
                throw err
            }
            
        })

        // return this.http.get('https://us-central1-ok-go-live.cloudfunctions.net/forgotPassword?phone='+phone).pipe(map(result => {
        //     return result.json()
        // })).toPromise().catch(err => {
        //     throw JSON.parse(err._body)
        // })
    }

    static verifyNumber(phone) {
        return Axios.get(`https://us-central1-ok-go-live.cloudfunctions.net/verifyPhone?phone=${phone}`).then(res => {
            return res.data
        })
    }

    static confirmPhoneNumber(phone, code) {
        return Axios.get(`https://us-central1-ok-go-live.cloudfunctions.net/confirmPhoneNumber?phone=${phone}&verificationCode=${code}`).then(res => {
            console.log(res.status)
            console.log(res.data)    

            if (res.status == 400) {
                throw {message: 'Incorrect verification code'}
            }

            return res.data
        }).catch(err => {
            // console.log(err.response)
            
            if (err.response && err.response.data) {
                throw {message: 'Incorrect verification code'}
            } else {
                throw err
            }
            
        })
    }

    static simulateAccident() {
        return UserService.uid().then(uid => {
            return PolicyService.policies().then(policies => {
                policies = policies.filter(policy => {
                      if (policy.claimed) {
                          return false
                      }

                      const now = moment().format('YYYY-MM-DD HH:mm:ss')
                      if (policy.effective_date < now && policy.anniversary_date > now) {
                          return true
                      } else {
                          return false
                      }
                  })

                if (policies.length > 0) {
                    const policy = policies[0]
                    console.log('Found policy')
                    console.log(policy.policy_id)
    
                    return LocationService.requestPermissions().then(() => {
                        return LocationService.getCurrentPosition().then(location => {
                            const lat = location.coords.latitude
                            const lng = location.coords.longitude
    
                            return {
                                lat: lat,
                                lng: lng
                            }
                        }).then(location => {
                            const {lat, lng} = location
                            console.log(`https://us-central1-ok-go-live.cloudfunctions.net/simulateCarAccident?policyId=${policy.policy_id}&lat=${lat}&lng=${lng}`)
                            return Axios.get(`https://us-central1-ok-go-live.cloudfunctions.net/simulateCarAccident?policyId=${policy.policy_id}&lat=${lat}&lng=${lng}`).then(data => {
                                console.log(data.data)
                            })
                        })  
                    })
                    
                } else {
                    throw { message: "You don't have any active policies" }
                }
            })
        })
    }
}