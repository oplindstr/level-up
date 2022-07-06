export default interface Mailer {
    sendEmail(to: string, message: string): Promise<void>;
}