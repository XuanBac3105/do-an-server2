import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name)

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest()
        const { method, url, ip } = request
        const body = request.body as Record<string, any>
        const userAgent = request.get('user-agent') || ''
        const now = Date.now()

        this.logger.log(`Incoming Request: ${method} ${url} - IP: ${ip} - UserAgent: ${userAgent}`)

        if (body && typeof body === 'object' && Object.keys(body).length > 0) {
            this.logger.debug(`Request Body: ${JSON.stringify(body)}`)
        }

        return next.handle().pipe(
            tap({
                next: (data) => {
                    const response = context.switchToHttp().getResponse()
                    const { statusCode } = response
                    const executionTime = Date.now() - now

                    this.logger.log(`Outgoing Response: ${method} ${url} - Status: ${statusCode} - ${executionTime}ms`)

                    if (data) {
                        this.logger.debug(`Response Data: ${JSON.stringify(data)}`)
                    }
                },
                error: (error) => {
                    const executionTime = Date.now() - now
                    this.logger.error(
                        `Request Failed: ${method} ${url} - ${executionTime}ms - Error: ${error.message}`,
                        error.stack,
                    )
                },
            }),
        )
    }
}
