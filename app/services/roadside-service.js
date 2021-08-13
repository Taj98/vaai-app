import Axios from "axios"
import firebase from "react-native-firebase"
import { UserService } from "./user-service"
import { Observable } from "rxjs"

export class RoadsideService {
    static newLocationRequest = () => {
        return firebase.database().ref(`newLocationRequests`).push({
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            location: null
        }).then(ref => {
            return ref.key
        })
    }

    static listenForFriendLocation = id => {
        return Observable.create(observer => {
            firebase.database().ref(`newLocationRequests/${id}`).on('value', snapshot => {
                const value = snapshot.val()

                console.log('location changed')
                console.log(value)

                if (value && value.location) {
                    observer.next(value.location)
                }
            })
        })
    }

    static uploadRoadsideAssistance(lat, lng) {
        return UserService.uid().then(uid => {
            return Axios.post('http://us-central1-ok-go-live.cloudfunctions.net/ok-go-live/us-central1/roadsideCost', JSON.stringify({
                userId: uid,
                lat: lat,
                lng: lng
            })).then(res => {
                return res.data
            })
        })
    }

    static listenForRoadsideRequestResult() {
        return Observable.create(observer => {
            let resultSent = false

            UserService.uid().then(uid => {
                return firebase.database().ref(`roadside/quotes`).orderByChild('userId').equalTo(uid).once('value').then(snapshot => {
                    const result = snapshot.val()
                    const requests = Object.keys(result ? result : {}).map(key => {
                        return {
                            ...result[key],
                            id: key
                        }
                    }).sort((a, b) => {
                        if (a.createdAt > b.createdAt) {
                            return -1
                        } else {
                            return 1
                        }
                    })

                    if (requests.length > 0) {
                        firebase.database().ref(`roadside/quotes/${requests[0].id}`).on('value', changeSnapshot => {
                            const quote = changeSnapshot.val()

                            if (resultSent === false && quote.accepted) {
                                observer.next({
                                    ...quote,
                                    id: changeSnapshot.key
                                })
                                resultSent = true
                            }
                        })
                    }
                })
            })
        })
    }

    static cancelCurrentPendingRoadside = () => {
        return RoadsideService.currentPendingRoadsideRequest().then(quote => {
            if (quote && quote.id) {
                return firebase.database().ref(`roadside/quotes/${quote.id}`).remove()
            }
        })
    }

    static currentPendingRoadsideRequest = () => {
        return UserService.uid().then(uid => {
            return firebase.database().ref(`roadside/quotes`).orderByChild('userId').equalTo(uid).once('value').then(snapshot => {
                const value = snapshot.val()
                const requests = Object.keys(value ? value : {}).map(key => {
                    return {
                        ...value[key],
                        id: key
                    }
                }).sort((a, b) => {
                    if (a.createdAt < b.createdAt) {
                        return -1
                    } else {
                        return 1
                    }
                }).filter(request => {
                    return !request.paid
                })

                // console.log(requests)
                
                if (requests.length > 0) {
                    return requests[0]
                } else {
                    return null
                }
            })
        })
    }

    static requestRoadside(options) {
        return UserService.uid().then(uid => {
            return firebase.database().ref(`roadside/quotes`).push({
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                paid: false,
                accepted: false,
                userId: uid,
                ...options
            })
        })
        
        // return UserService.uid().then(uid => {
        //     console.log(uid)
        //     return Axios.post('https://us-central1-ok-go-live.cloudfunctions.net/roadsideCost', JSON.stringify({
        //         userId: uid,
        //         ...options
        //     }), {
        //         headers: {
        //             'Content-Type': 'application/json'
        //         }
        //     }).then(res => {
        //         console.log(res.data)
        //         return res.data
        //     })
        // })
        
        // .pipe(map(response => {
        //     return response.json()
        // })).toPromise()
    }

    static currentPickup() {
        return Observable.create(observer => {
            return UserService.uid().then(uid => {
                console.log(uid)
                firebase.firestore().collection('pickups')
                    .where('arrivedAtSite', '==', false)
                    .where('user', '==', uid)
                    .orderBy('createdAt', 'DESC')
                    .limit(1)
                    .onSnapshot(snapshot => {
                        const pickup = snapshot.empty ? null : snapshot.docs[0].data()

                        observer.next(pickup)
                    }, err => {
                        console.log(err)
                    })
            })
        })
    }

    static driverLocation(pickup) {
        return Observable.create(observer => {
            firebase.firestore().collection('users').doc(pickup.driver).onSnapshot(snapshot => {
                observer.next(snapshot.data())
            })
        })
        
    }
}