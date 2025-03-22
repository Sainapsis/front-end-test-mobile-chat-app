import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { UserService } from 'src/api/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    logger: Logger;
    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly UserService: UserService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'O2/X+51vvrs0gaYoT8Zc6K9uEhCvD5ZlkCHW6PPXShmhlIZk4ExFp6aWHDSz9rme', //TO CHANGE!!!!!!!
        });
        this.logger = new Logger(JwtStrategy.name);
    }

    async validate(payload: any) {
        this.logger.log('Validate passport:', payload);
        return await this.UserService.findOne({ username: payload.username });
    }
}