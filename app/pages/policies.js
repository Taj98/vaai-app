import React, { useState, useEffect } from 'react'
import { Container, Card, CardItem, Button, Badge, View, Spinner, Text, Content, Body } from 'native-base'
import { PolicyService } from '../services/policy-service'
import moment from 'moment'
import { Alert } from 'react-native'
import { CustomHeader } from '../components/custom-header'
import { VaaiColors } from '../theme'
import { VaaiBackground } from '../components/vaai-background'

export const PoliciesPage = ({navigation}) => {
    const [policies, setPolicies] = useState(null)

    const update = () => {
        PolicyService.policies().then(policies => {
            setPolicies(policies.reverse())
        })
    }

    useEffect(() => {
        update()
    }, [])

    const isActive = (policy) => {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')

        return (policy.effective_date < now && policy.anniversary_date > now)
    }

    const isOld = (policy) => {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')

        return policy.anniversary_date < now
    }

    const isNew = policy => {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')

        return policy.effective_date > now
    }
    
    const takePictures = (policy) => {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')

        if (policy.effective_date < now && policy.anniversary_date > now) {
            navigation.navigate('UploadPolicyPhotos', {
                policyId: policy.policy_id,
                callback: update
            })
        } else {
            Alert.alert('Not Active', `Your cover is not active. You can only take photos from ${policy.effective_date}`)
        }
    }

    const claim = (policy) => {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')

        if (policy.effective_date < now && policy.anniversary_date > now) {
            if (!policy.picturesTaken) {
                Alert.alert("Can't Claim", `Your policy is not valid until you do a self inspection`)
            } else {
                console.log(policy.id)
                navigation.navigate('Claim', {
                    policy: policy,
                    callback: update
                })
            }
        } 
        else {
            console.log(policy.anniversary_date, now)
            if (policy.anniversary_date > now) {
                Alert.alert("Can't Claim", `Your cover is not active yet.`)
                // Alert.alert("Can't Claim", 'The opportunity to submit a claim has expired. Contact Us for help.')
            } else {
                
                Alert.alert("Can't Claim", 'The opportunity to submit a claim has expired. Contact Us for help.')
            }
        }
    }
    const now = moment().format('YYYY-MM-DD HH:mm:ss')

    return (
        <Container style={{backgroundColor: VaaiColors.blue}}>
            <VaaiBackground showTop={false} />
            {policies && policies.length > 0 && <Content style={{padding: 10}}>
            {policies.map((policy, index) => {
                return (
                    <Card key={index}>
                        <CardItem>
                            <Body>
                                <Text style={{fontWeight: 'bold', fontSize: 20}}>Policy {policy.policy_number}</Text>
                                <Text note>Created {moment(policy.created_at).fromNow(true)} ago</Text>
                                {/* <Text note>Starts: {policy.effective_date}</Text>
                                <Text note>Ends: {policy.anniversary_date}</Text> */}
                            </Body>
                        </CardItem>
                        <CardItem>
                            <Body>
                                <Text>{policy.make}</Text>
                                <Text>{policy.year} {policy.variant}</Text>
                                <Text>{policy.registration}</Text>
                                {policy.claimed ? (
                                    <View style={{alignItems: 'flex-end'}}>
                                        {/* <Badge success> */}
                                            <Text style={{color: 'orange'}}>Claimed</Text>
                                        {/* </Badge> */}
                                    </View>
                                ) : (
                                    <View>
                                        {isActive(policy) ? 
                                        <Text style={{color: 'green'}}>Active</Text> :
                                        (isOld(policy) ? 
                                        <Text style={{color: 'red'}}>Cover expired {moment(policy.anniversary_date).fromNow()}</Text> :
                                        <Text style={{color: 'green'}}>Cover starts {moment(policy.effective_date).fromNow()}</Text>)}
                                    </View>
                                )}
                            </Body>
                            
                        </CardItem>
                        <CardItem footer>
                            <Button style={{backgroundColor: VaaiColors.orange}} onPress={() => {
                                console.log('View policy')
                                navigation.navigate('Policy', {
                                    policy: policy
                                })
                            }} small rounded>
                                <Text style={{textTransform: 'capitalize'}}>View</Text>
                            </Button>
                            <Button disabled={policy.claimed || isNew(policy) || isOld(policy) || policy.picturesTaken} onPress={() => {
                                takePictures(policy)
                            }} small rounded style={{marginLeft: 10, backgroundColor: policy.claimed || isNew(policy) || isOld(policy) || policy.picturesTaken ? '#dfdfdf' : VaaiColors.orange}}>
                                <Text style={{textTransform: 'capitalize', color: policy.claimed || isNew(policy) || isOld(policy) || policy.picturesTaken ? 'white' : 'white'}}>Self Inspection</Text>
                            </Button>
                            <Button small disabled={(policy.effective_date > now && policy.anniversary_date < now) || policy.claimed} style={{backgroundColor: policy.effective_date < now && policy.anniversary_date > now && !policy.claimed ? VaaiColors.orange : '#dfdfdf', marginLeft: 10}} rounded onPress={() => claim(policy)}>
                                <Text style={{textTransform: 'capitalize'}}>Claim</Text>
                            </Button>
                        </CardItem>
                    </Card>
                )
            })}
            </Content>}
            {!policies && <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                    <Spinner color='black' />
                </View>}

            {policies && policies.length == 0 && <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, padding: 40}}>
                <Text style={{color: 'white'}}>You currently don't have any policies</Text>
            </View>}
        </Container>
    )
}

PoliciesPage.navigationOptions = ({navigation}) => {
    return {
        title: 'Policies',
        header: <CustomHeader headerNextToBack={true} navigation={navigation} title='Policies' backgroundColor={VaaiColors.blue} />
    }
}