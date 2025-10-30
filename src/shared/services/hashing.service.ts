import { Injectable } from '@nestjs/common'
import { hash, compare } from 'bcrypt'

@Injectable()
export class HashingService {
    private readonly saltRounds = 10

    async hash(value: string): Promise<string> {
        return hash(value, this.saltRounds)
    }

    async compare(value: string, hashedValue: string): Promise<boolean> {
        return compare(value, hashedValue)
    }
}
