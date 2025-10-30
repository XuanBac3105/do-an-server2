import { Injectable } from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import envConfig from '../config'
import { v4 as uuidv4 } from 'uuid'
import { TokenPayload } from '../types/jwt.type'

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) {}

    signAccessToken(payload: { userId: number }): string {
        return this.jwtService.sign(
            { ...payload, uuid: uuidv4() },
            {
                secret: envConfig.ACCESS_TOKEN_SECRET,
                expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN as JwtSignOptions['expiresIn'],
                algorithm: 'HS256',
            },
        )
    }

    signRefreshToken(payload: { userId: number }): string {
        return this.jwtService.sign(
            { ...payload, uuid: uuidv4() },
            {
                secret: envConfig.REFRESH_TOKEN_SECRET,
                expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN as JwtSignOptions['expiresIn'],
                algorithm: 'HS256',
            },
        )
    }

    verifyAccessToken(token: string): Promise<TokenPayload> {
        return this.jwtService.verifyAsync(token, {
            secret: envConfig.ACCESS_TOKEN_SECRET,
        })
    }

    verifyRefreshToken(token: string): Promise<TokenPayload> {
        return this.jwtService.verifyAsync(token, {
            secret: envConfig.REFRESH_TOKEN_SECRET,
        })
    }
}
