import { UserService } from "./user-service"
import firebase from "react-native-firebase"

export class HistoryService {
    static history() {
        return UserService.uid().then(uid => {
            return firebase.database().ref('history').orderByChild('uid').equalTo(uid).once('value').then(snapshot => {
                const results = snapshot.val()

                if (results) {
                    const keys = Object.keys(results)

                    return keys.map(key => {
                        return {
                            ...results[key],
                            id: key
                        }
                    })
                } else {
                    return []
                }
            })
        })
    }
}