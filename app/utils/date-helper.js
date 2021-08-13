import moment from 'moment'

export const isDobLessThan18Years = (dobString) => {
    const todayMinus18Years = moment().subtract(18, 'years')
    const dobMoment = moment(dobString)
    return todayMinus18Years.diff(dobMoment, 'days') < 0
}

export const getDobFromIDNumber = (idNumber) => {
    if (numberInputHasOtherCharacters(idNumber)) {
        return
    }
    return moment(idNumber.substring(0, 6), 'YYMMDD').format('YYYY-MM-DD') 
}

export const numberInputHasOtherCharacters = (input) => {
    var numbers = /^[0-9]+$/;
    return !input?.match(numbers)
}

export const inputHasSpecialCharacters = (input) => {
    var format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~0-9]/
    return !format.test(input)
}