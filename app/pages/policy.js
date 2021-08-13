import React, { useEffect, useState } from 'react'
import { Container, List, ListItem, Body, Text, Content, View, Spinner, Button, Icon } from "native-base"
import moment from 'moment'
import { PolicyService } from '../services/policy-service'
import { CustomHeader } from '../components/custom-header'
import { VaaiColors } from '../theme'
import { VaaiBackground } from '../components/vaai-background'
import { Linking, Alert } from 'react-native'
import OBDService from '../obd-service';

export const PolicyPage = ({navigation}) => {
    const [policy, setPolicy] = useState(navigation.getParam('policy'))
    const policyId = navigation.getParam('policyId')
    const keyLabels = [
        {
            key: 'policy_number',
            label: 'Policy Number'
        },
        {
            key: 'created_at',
            label: 'Created At'
        },
        {
            key: 'effective_date',
            label: 'Starts on'
        },
        {
            key: 'anniversary_date',
            label: 'Ends on'
        },
        {
            key: 'make',
            label: 'Make'
        },
        {
            key: 'model',
            label: 'Model'
        },
        {
            key: 'variant',
            label: 'Variant'
        },
        {
            key: 'year',
            label: 'Year'
        },
        {
            key: 'registration',
            label: 'Registration'
        },
        {
            key: 'sum_insured',
            label: 'Sum Insured'
        },
        {
            key: 'premium',
            label: 'Premium'
        }
    ]

    useEffect(() => {
        console.log(policy, policyId)
        if (policy == null && policyId != null) {
            PolicyService.policy(policyId).then(policy => {
                setPolicy(policy)
            })
        }
    }, [])

    const renderValue = (key, value) => {
        switch (key) {
            case 'created_at':
                return moment(value).format('YYYY-MM-DD HH:mm:ss')
            case 'effective_date':
                return moment(value).format('DD MMMM YYYY HH:mm')
            case 'anniversary_date':
                return moment(value).format('DD MMMM YYYY HH:mm')
        }

        return value
    }

    const downloadPolicySchedule = () => {
        if (policy.policySchedule) {
            Linking.openURL(policy.policySchedule)
        } else {
            Alert.alert('Not available', 'You policy schedule is not yet available.')
        }
    }

    const testOBD = () => {
        // OBDService.getPolicyOBDData(policy.policy_number, err => {
        //     console.log('Error ' + err)
        // }, data => {
        //     console.log("Data: " + data)
        // })
        // console.log('Registering')
        OBDService.registerPolicy(policy.policy_number, policy.effective_date, policy.anniversary_date, err => {
            
        }, success => {
            console.log('Registered')
        });
    }

    const stopOBD = () => {
        OBDService.deregisterPolicy(policy.policy_number)
    }

    return (
        <Container style={{backgroundColor: VaaiColors.blue}}>
            <VaaiBackground showTop={false} />
            {policy ? <Content style={{marginBottom: 70}}>
                <View style={{padding: 20, paddingBottom: 0}}>
                    <Button bordered light block onPress={downloadPolicySchedule}>
                        <Text>Download Policy Schedule</Text>
                    </Button>
                </View>
                <View style={{padding: 20, paddingBottom: 0}}>
                    <Button bordered light block onPress={testOBD}>
                        <Text>Test OBD</Text>
                    </Button>
                </View>
                <View style={{padding: 20, paddingBottom: 0}}>
                    <Button bordered light block onPress={stopOBD}>
                        <Text>Stop OBD</Text>
                    </Button>
                </View>
                <List style={{backgroundColor: VaaiColors.purple, marginLeft: 30,
                    marginRight: 30, marginTop: 30}}>
                    {keyLabels.map(item => {
                        return (
                            <ListItem key={item.key} style={{marginLeft: 10, marginRight: 10, borderBottomColor: 'white'}}>
                                <Body>
                                    <Text style={{color: 'white'}}>
                                        {item.label}
                                    </Text>
                                    <Text note style={{color: 'white'}}>
                                        {renderValue(item.key, policy[item.key])}
                                    </Text>
                                </Body>
                            </ListItem>
                        )
                    })}
                </List>

                <View style={{padding: 20}}>
                    <Button bordered light block onPress={downloadPolicySchedule}>
                        <Text>Download Policy Schedule</Text>
                    </Button>
                </View>
            </Content> :
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Spinner color='black' />
            </View>}
        </Container>
    )
}

PolicyPage.navigationOptions = ({navigation}) => {
    // const downloadSchedule = () => {
    //     Linking.openURL('https://vaai.co')
    // }

    return {
        title: 'Policy Info',
        header: <CustomHeader
            title='Policy Info'
            backgroundColor={VaaiColors.blue}
            headerNextToBack={true} 
            navigation={navigation}
            // headerRight={<Button transparent onPress={downloadSchedule}><Icon name='document' style={{color: 'white'}} /></Button>}
        />
    }
}