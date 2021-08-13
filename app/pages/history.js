import React, { useState, useEffect } from 'react'
import { Container, Content, Text, View, Spinner, List, ListItem, Card, CardItem, Body, Right, Button } from 'native-base'
import moment from 'moment'
import { HistoryService } from '../services/history-service'
import { CustomHeader } from '../components/custom-header'
import { VaaiColors } from '../theme'
import { VaaiBackground } from '../components/vaai-background'

export const HistoryPage = ({navigation}) => {
    const [history, setHistory] = useState(null)

    useEffect(() => {
        HistoryService.history().then(history => {
            console.log(history)
            setHistory(history)
        })
    }, [])

    return (
        <Container style={{backgroundColor: VaaiColors.homeGreen}}>
            <VaaiBackground showTop={false} />
            {history ? 
            <Content contentContainerStyle={{padding: 10}}>
                {history.map((item, index) => {
                    return (
                        <Card key={index}>
                            <CardItem>
                                <Body>
                                    <Text style={{fontWeight: 'bold', fontSize: 18}}>{item.policyNumber}</Text>
                                    <Text note>{moment(new Date(item.createdAt)).fromNow()}</Text>
                                </Body>
                            </CardItem>
                            <CardItem>
                                <Body>
                                    <Text>{item.content}</Text>
                                </Body>
                            </CardItem>
                            <CardItem>
                                <Body></Body>
                                <Right>
                                    <Button small rounded style={{backgroundColor: VaaiColors.orange}} onPress={() => {
                                        navigation.navigate('Policy', {
                                            policyId: item.policy
                                        })
                                    }}>
                                        <Text style={{textTransform: 'capitalize'}}>View Policy</Text>
                                    </Button>
                                </Right>
                            </CardItem>
                        </Card>
                    )
                })}
            </Content> :
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Spinner color='black' />
            </View>}
        </Container>
    )
}

HistoryPage.navigationOptions = ({navigation}) => {
    return {
        title: 'History',
        header: <CustomHeader 
            title='History'
            headerNextToBack={true}
            backgroundColor={VaaiColors.homeGreen}
            navigation={navigation}
        />
    }
}