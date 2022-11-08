const nodemailer = require("nodemailer");

const sendEmail = async (userMail, subject, text) => {
  let testAccount = await nodemailer.createTestAccount()

  let config = nodemailer.createTransport({
    host: process.env.HOST_EMAIL,
    port: process.env.PORT_EMAIL,
    secure: false,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.PASS_EMAIL
    }
  });

  const sendMailNow = await config.sendMail({
    from: process.env.USER_EMAIL, // sender address
    to: userMail, // receiver
    subject: subject, // Subject line
    text: text, // plain text body
    html: `<b>${text}</b>`, // html body
  })

  console.log("Message sent: %s", sendMailNow.messageId);
};

// sendEmail().catch((e)=>console.log(e))


module.exports = sendEmail;
