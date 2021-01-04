module.exports = {
    createTransport() {
        return {
            sendMail() {
                console.log('Mocks of nodemailer used!')
            }
        }
    }
}