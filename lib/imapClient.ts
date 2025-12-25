import { ImapFlow } from "imapflow";

export async function getImapClient() {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.IMAP_EMAIL,
      pass: process.env.IMAP_APP_PASSWORD,
    },
  });

  await client.connect();
  return client;
}
