import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../config'

@Injectable()
export class EmailService {
    private resend: Resend
    constructor() {
        this.resend = new Resend(envConfig.RESEND_API_KEY)
    }

    sendEmail(payload: { email: string; content: string; subject: string }) {
        return this.resend.emails.send({
            from: 'Tutor Center <onboarding@resend.dev>',
            to: [payload.email],
            subject: `${payload.subject}`,
            html: `<p>${payload.content}</p>`,
        })
    }
}
