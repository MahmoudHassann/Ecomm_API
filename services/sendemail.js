import nodeoutlook from 'nodejs-nodemailer-outlook'

export function sendEmail(dest, message) {
    console.log(process.env.SENDER_EMAIL);
    console.log(process.env.SENDER_PASSWORD);
    nodeoutlook.sendEmail({
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASSWORD
        },
        from: process.env.SENDER_EMAIL,
        to: dest,
        subject: 'Welcome To Our Company!',
        html: message,
        onError: (e) => console.log(e),
        onSuccess: (i) => console.log(i)
    }


    );
}


/* import nodemailer from 'nodemailer'
export async function sendEmail(dest, subject, message, attachments = []) {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SENDER_EMAIL, // generated ethereal user
            pass: process.env.SENDER_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `"Bakery Shop" < ${process.env.SENDER_EMAIL}>`, // sender address
        to: dest, // list of receivers
        subject, // Subject line
        html: message, // html body
        attachments
    });
    return info
} */
