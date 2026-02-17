import { Resend } from "resend";

const FROM = "kin-ky <notifications@kin-ky.com>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendMatchNotification(email: string, matchName: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "you got a match on kin-ky!",
    html: `
      <p>hey! you've been matched with <strong>${matchName}</strong> this week.</p>
      <p>head to <a href="https://www.kin-ky.com/match">kin-ky.com</a> to see their preview and decide if you're down.</p>
      <p>- kin-ky</p>
    `,
  });
}

export async function sendMutualInterestNotification(
  email: string,
  matchName: string,
  matchInstagram: string,
) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "your match is down too!",
    html: `
      <p>good news - you and <strong>${matchName}</strong> are both down!</p>
      <p>their photo and instagram are now unlocked. reach out and make it happen.</p>
      ${matchInstagram ? `<p>instagram: <strong>${matchInstagram}</strong></p>` : ""}
      <p>check it out at <a href="https://www.kin-ky.com/match">kin-ky.com</a></p>
      <p>- kin-ky</p>
    `,
  });
}
