import firebase from "react-native-firebase";

export class VehicleService {
    static models(make) {
        return firebase.database().ref(`models`).orderByChild('make').equalTo(make).once('value').then(snapshot => {
            const data = snapshot.val()
            const keys = Object.keys(data).sort((a, b) => {
                if (a > b) {
                    return 1
                } else {
                    return -1
                }
            })

            return keys.map(key => {
                return {
                    id: key,
                    ...data[key]
                }
            })
        })
    }

    static variants(model) {
        return firebase.database().ref(`variants`).orderByChild('model').equalTo(model).once('value').then(snapshot => {
            const data = snapshot.val()
            const keys = Object.keys(data).sort((a, b) => {
                if (a > b) {
                    return 1
                } else {
                    return -1
                }
            })

            return keys.map(key => {
                return {
                    id: key,
                    ...data[key]
                }
            })
        })
    }

    static years(variant) {
        return firebase.database().ref(`years`).orderByChild('variant').equalTo(variant).once('value').then(snapshot => {
            const data = snapshot.val()
            const keys = Object.keys(data).sort((a, b) => {
                if (a > b) {
                    return 1
                } else {
                    return -1
                }
            })

            return keys.map(key => {
                return {
                    id: key,
                    ...data[key]
                }
            })
        })
    }

    static vehicle(make, model, variant, year) {
        return firebase.database().ref(`vehicles/${make}/${model}/${variant}/${year}`).once('value').then((snapshot => {
            return snapshot.val()
        }))
    }
}