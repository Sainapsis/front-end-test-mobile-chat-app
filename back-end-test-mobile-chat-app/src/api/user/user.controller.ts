import {
  Controller,
  Post,
  Request,
  Logger,
  HttpException,
  HttpStatus,
  BadRequestException,
  Get,
  UseGuards,

} from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/utils/authGuard';


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
      if (!newUser.password) throw new BadRequestException('No password provided');

      const user = await this.userService.create(newUser);
      return user
    } catch (err) {
      this.logger.error('Something went wrong in signup:', err);
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, name: err.name, message: err.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('userProfileData')
  async getUserData(@Request() req) {
    try {
      return await req.user;
    } catch (err) {
      this.logger.error('Something went wrong in getting user data:', err);
      throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, name: err.name, message: err.message }, HttpStatus.INTERNAL_SERVER_ERROR)
    }

  }

  @UseGuards(JwtAuthGuard)
  @Get('publicProfiles')
  async getPublicProfiles(@Request() req) {
    const currentUser = req.user;
    try{
      return await this.userService.getPublicProfiles(currentUser._id);
    }catch (err){
      this.logger.error('Something went wrong in getting public profiles:', err);
      throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, name: err.name, message: err.message }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

}