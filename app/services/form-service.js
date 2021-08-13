import { UserService } from "./user-service";
import firebase from "react-native-firebase";

export class FormService {
    static setCurrentMessage(currentMessage, type) {
        return UserService.uid().then(uid => {
            return firebase.database().ref(`forms/${uid}/${type}/currentMessage`).transaction(value => {
                value = JSON.parse(JSON.stringify(currentMessage))

                return value
            })
        })
    }

    static setValues(formValues, type) {
        return UserService.uid().then(uid => {
            return firebase.database().ref(`forms/${uid}/${type}/formValues`).transaction(values => {
                values = JSON.parse(JSON.stringify(formValues))

                return values
            })
        })
    }

    static add(message, type, formValues) {
        return UserService.uid().then(uid => {
            return firebase.database().ref(`forms/${uid}/${type}`).transaction(value => {
                if (value == null) {
                    value = {
                        formValues: JSON.parse(JSON.stringify(formValues)),
                        messages: [message]
                    }
                } else {
                    if (message && value && value.messages) {
                        console.log(message)
                        value.messages.push(message)
                        value.formValues = JSON.parse(JSON.stringify(formValues))
                    }
                }

                return value
            })
        })
    }

    static form(type) {
        return UserService.uid().then(uid => {
            return firebase.database().ref(`forms/${uid}/${type}`).once('value').then(snapshot => {
                return snapshot.val()
            })
        })
    }

    static remove(type) {
        return UserService.uid().then(uid => {
            return firebase.database().ref(`forms/${uid}/${type}`).remove()
        })
    }
}