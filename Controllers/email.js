
const nodemailer = require('nodemailer');
const mailgen = require('mailgen');
require('dotenv').config();
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
  process.env.Client_Id,
  process.env.Client_Secret
);
client.setCredentials({refresh_token: process.env.Refresh_Token})




  const sendEmail =  async (req, res) => {
    const accessToken = client.getAccessToken();
   const {body,greeting ,receiver,sender,signature,subject} = req.body;
   if (!receiver) {
    res.status(400).send({ message: "Please Select TA!" });
  }

   let config ={
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.User,
        clientId: process.env.Client_Id,
        clientSecret: process.env.Client_Secret,
        refreshToken: process.env.Refresh_Token,
        accessToken: accessToken,
    }
   }
   const recipients = receiver.map((recipient) => recipient.email).join(',');
    const transporter = nodemailer.createTransport(config);

    const mailGenerator = new mailgen({
        theme: 'default',
        product: {
          link: 'https://mailgen.js'          
        }
        
      });

   const response = {
        body: {
          greeting: greeting,
          intro:body,
          signature: signature}
        
      };
      
    const mail = mailGenerator.generate(response);

      let message ={
        from: sender,
        to: recipients,
        subject: subject,
        html: mail
      }
transporter.sendMail(message).then(()=>{
  res.status(201).send({
    message: "Your email has been successfully sent.", });
    console.log("Your email has been successfully sent.");
}).catch(error=>{
  res.status(500).send({ message: "failed to mail" });
  console.log("failed to mail");
})
     
};

module.exports = {sendEmail};
