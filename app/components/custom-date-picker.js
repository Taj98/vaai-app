import { View, Text } from 'native-base'
import { TouchableOpacity} from 'react-native'
import React, { useState } from 'react'
import moment from 'moment'
import DateTimePicker from "react-native-modal-datetime-picker";

export const CustomDatePicker = ({ value, onChangeDate, minimumDate, maximumDate }) => {
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [date, detDate] = useState(value && value.length == 5 ? value : '')

    const dateConfirmed = (date) => {
        const selectedDate = moment(date).format('YYYY-MM-DD')
        detDate(selectedDate)
        setShowDatePicker(false)

        if (onChangeDate != null) {
            onChangeDate(selectedDate)
        }
    }

    const cancelDatePicker = () => {
        setShowDatePicker(false)
    }

    return (
        <View style={{paddingLeft: 20, flex: 1}}>
            <DateTimePicker
                isVisible={showDatePicker}
                onConfirm={dateConfirmed}
                onCancel={cancelDatePicker}
                mode='date'
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                date={new Date()}

            />

            <TouchableOpacity onPress={() => {
                setShowDatePicker(true)
            }}>
                {date ? <Text>{date}</Text> : <Text style={{color: '#a0a0a0'}}>Select Date</Text>}
            </TouchableOpacity>
            
        </View>
    )
}