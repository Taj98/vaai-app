import Axios from "axios"
import { UserService } from "./user-service"
import firebase from "react-native-firebase"
import { DeviceService } from "./device-service"

export class EngineService {
    static SERVER = 'https://vaai.insuranceengine.co.za/api/v1.1/'
    static userId = null

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

    static profile() {
        console.log('Getting UID')
        return EngineService.uid().then(uid => {
            console.log('UID: ' + uid)
            if (uid) {
                return firebase.firestore().collection('users').doc(uid).get().then(snapshot => {
                    return {
                        ...snapshot.data(),
                        id: uid
                    }
                })
            }

            return null
        })
        
    }

    static async get(path, auth = true) {
        let token = ''

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        if (auth) {
            const profile = await UserService.profile()    

            if (profile) {
                token = profile.engineToken
                headers['Authorization'] = 'Bearer ' + token
                console.log('Token is ' + token)
            }
        }

        console.log('Connecting to ' + EngineService.SERVER + path)
        const res = await Axios.get(EngineService.SERVER + path, {
            headers: headers
        })
        // console.log(res.data)

        return res.data
    }

    static async post(path, data, auth = true) {
        console.log('Auth: ' + auth)
        let token

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        if (auth) {
            const profile = await UserService.profile()    

            if (profile) {
                token = profile.engineToken
                headers['Authorization'] = 'Bearer ' + token
                console.log('Token is ' + token)
            } else {
                throw {message: 'Not Authorized'}
            }
        }

        console.log('Connecting to ' + EngineService.SERVER + path)
        console.log(JSON.stringify(data))
        try {
            const res = await Axios.post(EngineService.SERVER + path, JSON.stringify(data), {
                headers: headers
            })
            console.log(res.data)
            return res.data
        } catch (error) {
            console.log('Error posting to Engine', error)
        }
    }

    static calculateCostByVIN(vinNumber, monthly) {
        if(monthly) {
            return EngineService.get(`vehicle/vin/${vinNumber}/17`);
        }
        return EngineService.get(`vehicle/vin/${vinNumber}`)
    }

    static activatePolicy(policy_id, pictures) {
        console.log('activate policy id', policy_id)
        console.log('activate policy pictures', pictures)
        return EngineService.post(`policy/${policy_id}`, {
            pictures: pictures
        }).then(result => {
            console.log('Engine activate policy response', result)
            return result
        })
    }

    static quote(policyData) {
        const { owner } = policyData

        return DeviceService.deviceInfo().then(device => {
            return EngineService.profile().then(profile => {
                return EngineService.post('quote', {
                    ...policyData,
                    user_id: profile.engineId,
                    client_id: profile.engineId
                }).then(quote => {
                    return firebase.database().ref(`quotes/${quote.id}`).set({
                        userId: profile.id,
                        ...quote.cover[0],
                        provider: quote.provider,
                        anniversary_date: policyData.anniversary_date,
                        deviceId: device.deviceId,
                        owner: owner
                    }).then(() => {
                        return {
                            userId: profile.id,
                            ...quote.cover[0],
                            provider: quote.provider,
                            anniversary_date: policyData.anniversary_date,
                            owner: owner
                        }
                    })
                })
            })
        })
        
    }

    static tooMuch(quoteId) {
        return EngineService.get(`quote/${quoteId}/options`).then(options => {
            return Object.keys(options).map(key => {
                return {
                    sum_insured: parseInt(options[key].sum_insured),
                    premium: parseInt(options[key].premium)
                }
            })
        })
    }

    static createClaim(claim) {
        return DeviceService.deviceInfo().then(device => {
            return EngineService.profile().then(profile => {
                return EngineService.post(`claim`, {
                    ...claim,
                    entity_id: profile.engineId
                })
            })
        })
    }

    static updateClaim(claim, id) {
        return DeviceService.deviceInfo().then(device => {
            return EngineService.profile().then(profile => {
                return EngineService.post(`claim/${id}`, {
                    ...claim,
                    entity_id: profile.engineId
                })
            })
        })
    }
    
    static createUser(profile) { // currently only works for south african phone numbers
        let phone = profile.phone
        let areaCode

        if (phone.substr(0, 2) === '27') {
            phone = '0' + phone.substr(1, 10)
        }

        // split the number
        areaCode = phone.substr(0, 3)
        phone = phone.substr(3, 10)    

        return EngineService.post('entity', {
            first_name: profile.name,
            last_name: profile.surname,
            identifying_number: profile.idNumber,
            status: 1,
            contact: [{
                type: 'cell',
                international_code: '+27',
                area_code: areaCode,
                telephone_number: phone
            }],
            owner: {
                first_name: profile.name,
                last_name: profile.surname,
                identifying_number: profile.idNumber,
                status: 1,
                contact: [{
                    type: 'cell',
                    international_code: '+27',
                    area_code: areaCode,
                    telephone_number: phone
                }]
            }
        }, false)
    }

    static policies() {
        return EngineService.profile().then(profile => {
            return EngineService.get(`entity/${profile.engineId}/policies`).then(policies => {
                const promises = policies.map(policy => {
                    return firebase.database().ref(`quotes/${policy.id}/cover/0`).once('value').then(snapshot => {
                        return {
                            ...policy,
                            cover: snapshot.val()
                        }
                    })
                })

                return Promise.all(promises)
            })
        })
    }

    static vehicles = {
        makes: () => {
            return EngineService.get('vehicle/make').then(makes => {
                const result = {}

                makes.forEach(item => {
                    result[item.make] = item.make_code
                })

                return result
            })
        },
        models: (make) => {
            return EngineService.get(`vehicle/model/${make}`).then(results => {
                const models = {}

                results.forEach(result => {
                    models[result.model_code] = result.model
                })

                return Object.keys(models).map(key => {
                    return {
                        model: models[key],
                        model_code: key
                    }
                }).sort((a, b) => {
                    if (a.model > b.model) {
                        return 1
                    }

                    return -1
                })
            })
        },
        variants: (make, model) => {
            return EngineService.get(`vehicle/variant/${make}/${model}`).then(results => {
                const variants = {}

                results.forEach(result => {
                    variants[result.mmcode] = result.variant
                })

                return Object.keys(variants).map(key => {
                    return {
                        variant: variants[key],
                        mmcode: key
                    }
                }).sort((a, b) => {
                    if (a.variant > b.variant) {
                        return 1
                    }

                    return -1
                })
            })
        },
        years: (variant) => {
            return EngineService.get(`vehicle/year/${variant}`).then(results => {
                const years = {}
                const mmcode = results.length > 0 ? results[0].mmcode : ''

                results.forEach(result => {
                    years[result.reg_year] = result.reg_year
                })

                return Object.keys(years).map(key => {
                    return {
                        reg_year: years[key],
                        mmcode: mmcode
                    }
                }).sort((a, b) => {
                    if (a.reg_year > b.reg_year) {
                        return 1
                    }

                    return -1
                })
            })
        }
    }
}