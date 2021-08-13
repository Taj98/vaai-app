import React from 'react'
import { View } from 'native-base'
import { Image } from 'react-native'

export const VaaiBackground = ({noCentre, showBottom = true, showTop = true}) => {
    return (
        <View style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}}>
            {showTop && <Image width='100%' resizeMode='contain' source={require('../assets/imgs/vaai-bg-top.png')}
            style={{aspectRatio: 3.76, position: 'absolute', width: '100%', height: undefined, resizeMode: 'contain'}} />}

            {showBottom && <Image resizeMode='contain' source={noCentre ? require('../assets/imgs/vaai-bg-bottom-no-centre.png') : require('../assets/imgs/vaai-bg-bottom.png')}
            style={{aspectRatio: 3.76, position: 'absolute', width: '100%', bottom: 0, left: 0, height: undefined, resizeMode: 'contain'}} />}
        </View>
    )
}