const mongoose = require('../utils/db')

const Contact = mongoose.model('Contact', {
    name: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    }
})

module.exports = Contact