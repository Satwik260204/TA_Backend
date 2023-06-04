const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
  process.env.Client_Id,
  process.env.Client_Secret
);




module.exports = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: [
      process.env.Client_Id,
    ],
  });
  
  return ticket.getPayload();
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
};
