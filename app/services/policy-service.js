import { UserService } from "./user-service";
import firebase from "react-native-firebase";
import { EngineService } from "./engine-service";

export class PolicyService {
    static policies() {
        return UserService.uid().then(uid => {
            return firebase.database().ref(`policies`).orderByChild('userId').equalTo(uid).once('value').then(snapshot => {
                const data = snapshot.val()
                const keys = Object.keys(data ? data : {})

                if (keys.length > 0) {
                    return keys.map(key => {
                        return {
                            ...data[key],
                            id: key
                        }
                    }).sort((a, b) => {
                        if (a.effective_date > b.effective_date) {
                            return 1
                        }

                        return -1
                    })
                } else {
                    return []
                }
            })
        })
    }

    static policy(id) {
        return firebase.database().ref(`policies/${id}`).once('value').then(snapshot => {
            return {
                ...snapshot.val(),
                id: id
            }
        })
    }

    static uploadPictures(id, files) {
        console.log('uploadPictures called')
        console.log('uploadPictures files', files)
        const filesForEngine = {}
        const promises =  files.map(file => {
            return firebase.storage().ref(`policies/${id}/${file.name}`).putFile(file.path).then(() => {
                return firebase.storage().ref(`policies/${id}/${file.name}`).getDownloadURL().then(url => {
                    filesForEngine[file.name] = url + '&extension=.jpg'
                }).catch(e => {
                    console.log(`Error getting URL for photo ${file.name}`, e);
                })
            }).catch(e => {
                console.log(`Error uploading photo ${file.name}`, e);
            })
        })

        return Promise.all(promises).catch(err => {
            console.log(JSON.stringify(err))

            return firebase.database().ref(`policies/${id}`).update({
                picturesTaken: true
            })
        }).then(response => {
            const pictures = {...filesForEngine}
            console.log(`policies/${id}`)
            console.log(`pictures`, pictures)
            console.log(`filesForEngine`, filesForEngine)
            EngineService.activatePolicy(id, pictures).then(result => {
                console.log(JSON.stringify(result.schedule))
                return firebase.database().ref(`policies/${id}`).update({
                    picturesTaken: true,
                    policySchedule: result.schedule.url
                }).then(() => {
                    return result.schedule.url
                })
            })
            
        })
    }
}