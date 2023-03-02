const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
  "437720385016-4b6pgdkgbn55m8ifo7gif60lndkkehu2.apps.googleusercontent.com",
  "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"
);

module.exports = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: [
      "437720385016-4b6pgdkgbn55m8ifo7gif60lndkkehu2.apps.googleusercontent.com",
    ],
  });
  return ticket.getPayload();
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
};
