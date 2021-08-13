import React, { useEffect, useState } from 'react'
import { Container, View, Spinner, Text, Button } from "native-base"
import WebView from "react-native-webview"
import { PaymentService } from '../services/payment-service'

export const PaymentPage = ({navigation}) => {
    const {getParam} = navigation
    const quoteId = getParam('quoteId')
    const callback = getParam('callback')
    const paymentType = getParam('paymentType')
    const amount = getParam('amount')
    const [url, setUrl] = useState(null)
    const [loading, setLoading] = useState(true)

    console.log(quoteId)
    console.log(paymentType)
    console.log(`https://us-central1-ok-go-live.cloudfunctions.net/coverPay?quoteId=${quoteId}`)


    const loadPaymentForm = () => {
        setLoading(true)
        PaymentService.getFNBPaymentUrl(quoteId, amount).then(url => {
            setUrl(url)
        })
        .catch(err => {
            console.log('Error')
            console.log(err)
        })
        .finally(() => {
            setLoading(false)
        })
    }

    useEffect(() => {
        console.log('Listening to ' + quoteId)
        const subscription = PaymentService.listenForPayment(quoteId).subscribe((paid) => {
            console.log('Payment status: ' + paid)
            if (paid) {
                callback(paid)
            }
        })

        loadPaymentForm()
    }, [])

    return (
        <Container>
            {url && <WebView 
                source={{
                    uri: url
                }}
                startInLoadingState
                scalesPageToFit
                javaScriptEnabled
                style={{flex: 1}}
            />}
            {loading && <View style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Spinner />
            </View>}

            {!loading && !url && (
                <View style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{textAlign: 'center', marginBottom: 20}}>Could not load payment form</Text>
                    <Button transparent onPress={loadPaymentForm}><Text>Try again</Text></Button>
                </View>
            )}
        </Container>
    )
}

PaymentPage.navigationOptions = {
    title: 'Payment'
}