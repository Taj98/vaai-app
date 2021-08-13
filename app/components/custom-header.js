import React from 'react'
import { View, Button, Icon, Text } from 'native-base'
import { VaaiBackground } from './vaai-background'
import { VaaiColors } from '../theme'

export const CustomHeader = ({headerNextToBack, navigation, backgroundColor = VaaiColors.blue, title, tintColor = 'white', headerRight}) => {
    return (
        <View style={{backgroundColor: backgroundColor}}>
            <VaaiBackground showBottom={false} />
            <View style={{marginLeft: 40, marginRight: 40, marginTop: 30}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Button transparent onPress={() => {
                        navigation.goBack()
                    }}>
                        <Icon style={{color: tintColor}} name='arrow-back' />
                    </Button>
                    <View style={{flex: 1}}>
                    {headerNextToBack && <Text style={{fontWeight: 'bold', fontSize: 24, color: tintColor, marginLeft: 10}}>{title}</Text>}
                    </View>
                    {headerRight}
                </View>
                {!headerNextToBack && <Text style={{fontWeight: 'bold', fontSize: 24, color: tintColor, marginTop: 20, marginBottom: 20}}>{title}</Text>}
            </View>
        </View>
    )
}