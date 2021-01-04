const nodemailer = require('nodemailer')

function transporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.MAIL_APP_PASSWORD
    }
  })
}

function sendWelcomeEmail(email, name) {

  const transporterObject = transporter()

  // send mail with defined transport object
  transporterObject.sendMail({
    from: `Task Manager API <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: 'Thanks for joining!',
    text: `Welcome to our service, ${name}!`,
    html: `<b>Welcome to our service, ${name}!</b>`
  })
}

function sendDeleteEmail(email, name) {

  const transporterObject = transporter()

  // send mail with defined transport object
  transporterObject.sendMail({
    from: `Task Manager API <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: 'We\'re sorry to see you leave',
    text: `We hope to see you back again someday, ${name}!`,
    html: `<b>We hope to see you back again someday, ${name}!</b>`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendDeleteEmail
}
