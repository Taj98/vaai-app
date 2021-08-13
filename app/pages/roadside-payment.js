import React, { useEffect } from 'react'
import { Container } from "native-base"
import WebView from "react-native-webview"
import { PaymentService } from '../services/payment-service'

export const RoadsidePaymentPage = ({navigation}) => {
    const {getParam} = navigation
    const quoteId = getParam('quoteId')
    const callback = getParam('callback')

    console.log(quoteId)
    console.log(`https://us-central1-ok-go-live.cloudfunctions.net/roadsidePayment?quoteId=${quoteId}`)

    useEffect(() => {
        console.log('Listening to ' + quoteId)
        const subscription = PaymentService.listenForRoadsidePayment(quoteId).subscribe((paid) => {
            console.log('Payment status: ' + paid)
            if (paid) {
                callback(paid)
            }
        })
    }, [])

    return (
        <Container>
            <WebView 
                source={{
                    uri: `https://us-central1-ok-go-live.cloudfunctions.net/roadsidePayment?quoteId=${quoteId}`
                }}
                startInLoadingState
                scalesPageToFit
                javaScriptEnabled
                style={{flex: 1}}
            />
        </Container>
    )
}

RoadsidePaymentPage.navigationOptions = {
    title: 'Payment'
}