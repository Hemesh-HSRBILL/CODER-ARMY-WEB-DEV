const validator = require("validator")

function validators(data) {
    const mandatoryField = ['firstName', 'emailid', 'password']

    const isAllowed = mandatoryField.every((key) => Object.keys(data).includes(key))
    if (!isAllowed) {
        throw new Error("invalid credential")
    }

    if (!validator.isEmail(data.emailid)) {
        throw new Error("invalid emailid")
    }

    if (!validator.isStrongPassword(data.password)) {
        throw new Error("weak Password")
    }

    if (!(data.firstName.length >= 3 && data.firstName.length <= 20)) {
        throw new Error("invalid Firstname")
    }
}

module.exports = validators;