import { UserService } from "./user-service";
import firebase from "react-native-firebase";
import { DeviceService } from "./device-service";
import { EngineService } from "./engine-service";
import { Observable } from "rxjs";
import OBDService from '../obd-service';

export class ClaimService {
    static findIncompleteClaim() {
        return UserService.uid().then(uid => {
            return firebase.database().ref(`policies`).orderByChild('completedClaim').equalTo(`false-${uid}`).once('value').then(snapshot => {
                const claims = snapshot.val()
                const keys = Object.keys(claims ? claims : {})

                if (keys.length > 0) {
                    return claims[keys[0]]
                }

                return null
            })
        })
    }

    // static updateClaim(claim) {
    //     return UserService.uid().then(uid => {
    //         return firebase.database().ref(`claims/${claim.policy.value.policy_id}`).update(claim).then(() => {
    //             return firebase.database().ref(`policies/${claim.policy.value.policy_id}`).update({
    //                 completedClaimAt: firebase.database.ServerValue.TIMESTAMP,
    //                 completedClaim: true
    //             }).then(() => {
    //                 return firebase.database().ref('history').push({
    //                     uid: uid,
    //                     type: 'claim',
    //                     content: `Completed claim for policy ` + claim.policy.value.policy_number,
    //                     createdAt: firebase.database.ServerValue.TIMESTAMP,
    //                     policy: claim.policy.value.policy_id
    //                 })
    //             })
    //         })
    //     })
    // }

    static updateClaim(claim, policy_number) {
        return firebase.database().ref(`claims/${claim.policy_id}`).once(`value`).then(snapshot => {
            const claim_id = snapshot.val().claim_id

            return EngineService.updateClaim(claim, claim_id).then(() => {
                return UserService.uid().then(uid => {
                    return firebase.database().ref(`claims/${claim.policy_id}`).update(claim).then(() => {
                        return firebase.database().ref(`policies/${claim.policy_id}`).update({
                            completedClaimAt: firebase.database.ServerValue.TIMESTAMP,
                            completedClaim: `true-${uid}`
                        }).then(() => {
                            return firebase.database().ref('history').push({
                                uid: uid,
                                type: 'claim',
                                content: `Completed claim for policy ` + policy_number,
                                createdAt: firebase.database.ServerValue.TIMESTAMP,
                                policy: claim.policy_id
                            })
                        })
                    })
                })
            })
        })
        
    }

    static submitClaim(claim, policy_number, tow, fullprocess) {
        const keys = Object.keys(claim['data']['pictures'])
        const imagesPromises = keys.map(key => {
            return firebase.storage().ref(`claimPhotos/${policy_number}/${key}`).putFile(claim['data']['pictures'][key]).then(ref => {
                return firebase.storage().ref(`claimPhotos/${policy_number}/${key}`).getDownloadURL().then(url => {
                    claim['data']['pictures'][key] = url + '&extension=.jpg'

                    return {
                        key: url
                    }
                })
            })
        })

        return Promise.all(imagesPromises).then(() => {
            return new Promise((resolve, reject) => {
                OBDService.getPolicyOBDData(policy_number, err => {
                    // const error = err == -1 ? 'OBD Date file not found' : "We can't seem to open the OBD file on your device. Please try again"
    
                    resolve(null)
                }, data => {
                    resolve(data)
                })
            }).then(file => {
                new Promise(resolve => {
                    if (file) {
                        firebase.storage().ref(`obdData/${policy_number}`).putFile(file).then(() => {
                            return firebase.storage().ref(`obdData/${policy_number}`).getDownloadURL().then(url => {
                                claim['data']['pictures']['obdData'] = url + '&extension=.csv'
                            })
                        }).then(() => {
                            resolve()
                        })
                    } else {
                        resolve()
                    }
                }).then(() => {
                    return EngineService.createClaim(claim).then(result => {
                        return DeviceService.deviceInfo().then(device => {
                            return UserService.uid().then(uid => {
                                return firebase.database().ref(`claims/${claim.policy_id}`).set({
                                    ...claim,
                                    policy_number: policy_number,
                                    uid: uid,
                                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                                    pendingTow: `${tow}-${uid}`,
                                    deviceId: device.deviceId,
                                    appVersion: device.appVersion,
                                    claim_id: result.id
                                }).then(ref => {
                                    return firebase.database().ref('history').push({
                                        uid: uid,
                                        type: 'claim',
                                        content: `Claimed for policy ` + policy_number,
                                        createdAt: firebase.database.ServerValue.TIMESTAMP,
                                        policy: claim.policy_id
                                    }).then(() => {
                                        return firebase.database().ref(`policies/${claim.policy_id}`).update({
                                            claimed: true,
                                            claimedAt: firebase.database.ServerValue.TIMESTAMP,
                                            completedClaim: `${fullprocess}-${uid}`
                                        })
                                        // .then(() => {
                                        //     if (claim.towTime == 'Now') {
                                        //         return ClaimService.pickup(claim)
                                        //     }
                                        // })
                                    })
                                })
                            })
                        })
                    })
                })
                
            })
        }) 
    }

    static currentClaim() {
        return UserService.profile().then(user => {
            return firebase.database().ref(`claims`).orderByChild('pendingTow').equalTo(`true-${user.uid}`).once('value').then(snapshot => {
                const val = snapshot.val()
                const claims = Object.keys(val ? val : {})

                if (claims.length > 0) {
                    return val[claims[0]]
                }

                return null
            })
        })
    }

    static isPendingTow = () => {
        return Observable.create(observer => {
            UserService.profile().then(user => {
                firebase.database().ref(`claims`).orderByChild('pendingTow').equalTo(`true-${user.uid}`).on('value', snapshot => {
                    const val = snapshot.val()
                    const claims = Object.keys(val ? val : {})

                    if (claims.length > 0) {
                        console.log('Testing')
                        observer.next(val[claims[0]])
                    } else {
                        observer.next(null)
                    }
                })
            })
        })
    }

    static pickup(claim) {
        return UserService.profile().then(user => {
            return firebase.firestore().collection('pickups').add({
                completed: false,
                pending: true,
                policyId: claim.policy_id,
                locationPic: `https://maps.googleapis.com/maps/api/staticmap?center=${claim.data.vehicle_location.latitude},${claim.data.vehicle_location.longitude}&zoom=17&size=600x300&maptype=roadmap` +
                `&markers=color:red%7Clabel:L%7C${claim.data.vehicle_location.latitude},${claim.data.vehicle_location.longitude}` +
                "&key=AIzaSyBCnCPfmBgplyJw3fsk1bVzZIKaNZYCwSg",
                location: new firebase.firestore.GeoPoint(claim.data.vehicle_location.latitude, claim.data.vehicle_location.longitude),
                name: `${user.name} ${user.surname}`,
                type: 'Tow',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                user: user.uid,
                arrivedAtSite: false,
                requiresTow: true
            }).then(() => {
                return firebase.database().ref(`claims/${claim.policy_id}`).update({
                    pendingTow: `false-${user.uid}`
                })
            })
                
        })
    }
}