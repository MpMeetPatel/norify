import nodemailer from "nodemailer"

export const sendEmail = async options => {
    // 1) create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_PROVIDER_HOST,
        port: process.env.MAIL_PROVIDER_PORT,
        auth: {
            user: process.env.MAIL_PROVIDER_USERNAME,
            pass: process.env.MAIL_PROVIDER_PASSWORD
        }
        // if gmail as a services
        // activate less secure app in gmail act
    });

    // 2) define mail options
    const mailOptions = {
        from: 'Meet Patel <meet@pro.io>',
        to: options.email,
        subject: options.subject,
        text: options.message
        // html: ""
    };
    // 3) send the mail
    await transporter.sendMail(mailOptions);
};
