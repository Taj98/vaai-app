import React from 'react'
import { Image } from 'react-native'
import { Container, Content, View } from "native-base"
import { CustomHeader } from '../components/custom-header'
import { VaaiColors } from '../theme'
import { VaaiBackground } from '../components/vaai-background'

export const AccidentChecklistPage = () => {
    return (
        <Container style={{ backgroundColor: VaaiColors.homeGreen }}>
            <Content>
                <Image resizeMode='contain' style={{
                    width: '100%',
                    height: undefined,
                    aspectRatio: 1242 / 2208
                }} source={require('../assets/imgs/accident-checklist.gif')} />
            </Content>
        </Container>
    )
}

AccidentChecklistPage.navigationOptions = ({ navigation }) => {
    return {
        // title: 'Accident Checklist',
        header: null
    }
}