import { View, Text } from 'native-base'
import { TouchableOpacity} from 'react-native'
import React, { useState } from 'react'
import moment from 'moment'
import DateTimePicker from "react-native-modal-datetime-picker";

export const CustomTimePicker = ({ value, onChangeTime }) => {
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [time, setTime] = useState(value && value.length == 5 ? value : '')

    const timeConfirmed = (date) => {
        const selectedTime = moment(date).format('HH:mm')
        setTime(selectedTime)
        setShowTimePicker(false)

        if (onChangeTime != null) {
            onChangeTime(selectedTime)
        }
    }

    const cancelDatePicker = () => {
        setShowTimePicker(false)
    }

    return (
        <View style={{paddingLeft: 20, flex: 1}}>
            <DateTimePicker
                isVisible={showTimePicker}
                onConfirm={timeConfirmed}
                onCancel={cancelDatePicker}
                mode='time'
                is24Hour={true}
                date={time ? moment(`2012-01-01 ${time}`).toDate() : new Date()}
            />

            <TouchableOpacity onPress={() => {
                setShowTimePicker(true)
            }}>
                {time ? <Text>{time}</Text> : <Text style={{color: '#a0a0a0'}}>Select Time</Text>}
            </TouchableOpacity>
            
        </View>
    )
}