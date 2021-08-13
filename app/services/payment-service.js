import { Observable } from "rxjs";
import firebase from "react-native-firebase";
import { UserService } from "./user-service";
import Axios from "axios";


// LIVE
// const FNB_MERCHANT_ID = '385211'
// const FNB_API_KEY = '9AMUx1I4jLbliJWqyOiJyfgJXExZ4UUEHWJrQAb26DWa4qv5m5qGemGY4CmlhWml'
// const FNB_HOST = 'https://pay.ms.fnb.co.za'
// const validationURL = 'https://us-central1-ok-go-live.cloudfunctions.net/fnbPaymentValidation';
// DEMO
 const FNB_MERCHANT_ID = '200158'
 const FNB_API_KEY = 'WeK4QAxZD43rIXOh5ZnCAk1gzpJ4JXeJsfFiIlBawyevoe8NCOaU3HdPrUxBFQPK'
 const FNB_HOST = 'https://sandbox.ms.fnb.co.za'
 const validationURL = 'https://us-central1-ok-go-live.cloudfunctions.net/demoFnbPaymentValidation';

export class PaymentService {
    static listenForPayment(quoteId) {
        return Observable.create(observer => {
            console.log('Connecting to ' + `quotes/${quoteId}`)
            firebase.database().ref(`quotes/${quoteId}/paid`).on('value', (snapshot) => {
                const quote = snapshot.val()
                console.log(JSON.stringify(quote))
                observer.next(quote)
            })
        })
    }

    static listenForRoadsidePayment(quoteId) {
        return Observable.create(observer => {
            console.log('Connecting to ' + `roadside/quotes/${quoteId}`)
            firebase.database().ref(`roadside/quotes/${quoteId}/paid`).on('value', (snapshot) => {
                const quote = snapshot.val()
                console.log(JSON.stringify(quote))
                observer.next(quote)
            })
        })
    }

    static payWithCard(referenceId, amount) {
        // var windowReference = window.open()
        return Axios.post('https://us-central1-ok-go-live.cloudfunctions.net/payWithCard', JSON.stringify({
            amount: amount,
            id: referenceId
        })).then(res => {
            const data = res.data

            data['paymentUrl'] = `https://us-central1-ok-go-live.cloudfunctions.net/paymentForm?id=${data.id}`

            return data
        })
    }

    // static listenForPayment(id) {
    //     return Observable.create(observer => {
    //         firebase.firestore().doc(`payments/${id}`).onSnapshot(snapshot => {
    //             observer.next(snapshot.data())
    //         })
    //     })
    //     // return this.firestore.doc(`payments/${id}`).valueChanges()
    // }

    static queuePayment(productType, productData, cost) {
        return UserService.uid().then(uid => {
            return firebase.firestore().collection(`payments`).add({
                product: productType,
                ...productData,
                paymentSuccessful: false,
                paymentProcessed: false,
                uid: uid
            }).then(ref => {
                return ref.id
            })
        })
    }

    static getFNBPaymentUrl = (quoteId, amount) => {
        console.log({
            apiKey: FNB_API_KEY,
            merchantOrderNumber: quoteId,
            amount: parseInt(amount) * 100,
            validationURL,
            description: 'Vaai Insurance'
        })

        console.log('fnb host', FNB_HOST);

        return Axios.post(`${FNB_HOST}/eCommerce/v2/prepareTransaction`, JSON.stringify({
            apiKey: FNB_API_KEY,
            merchantOrderNumber: quoteId,
            amount: parseInt(amount) * 100,
            validationURL,
            description: 'Vaai Insurance'
        }), {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(result => {
            const token = result.data.txnToken
            console.log('Result')
            console.log(result.data)
            console.log(token)
            return `${FNB_HOST}/eCommerce/v2/getCreditCardForm?token=${token}`
        })
    }
}