import {
  Controller,
  Post,
  Request,
  Logger,
  HttpException,
  HttpStatus,

} from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
  logger: Logger;
  constructor(private readonly userService: UserService) {
    this.logger = new Logger(UserController.name);
  }

  @Post('create')
  async create(@Request() req): Promise<any> {
    const newUser = req.body;
    try {
      const query = { username: newUser.username };
      const userAlreadyExists = await this.userService.findOne(query);
      if (userAlreadyExists) throw new ConflictException('User Already Exist');
      const user = await this.userService.create(newUser);
      return user;
    } catch (err) {
      this.logger.error('Something went wrong in signup:', err);
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, name: err.name, message: err.message }, HttpStatus.BAD_REQUEST)
    }
  }
}