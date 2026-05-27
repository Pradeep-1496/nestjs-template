import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserModel } from 'src/common/models/user.model';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async register(createUser: RegisterDto) {
    try {
      const user = await UserModel.findOne({
        where: {
          email: createUser.email,
        },
      });

      if (user)
        throw new ConflictException('User already exist with same email');

      const hashPassword = await bcrypt.hash(createUser.password, 10);

      const newUser = {
        name: createUser.name,
        email: createUser.email,
        password: hashPassword,
      };

      this.logger.info('Register User');

      await UserModel.create(newUser);

      return await this.login({
        email: createUser.email,
        password: createUser.password,
      });
    } catch (error) {
      this.logger.error(error, 'Error in Register user');

      throw error;
    }
  }

  async login(LoginUser: LoginDto) {
    try {
      if (!LoginUser.email || !LoginUser.password)
        throw new ConflictException('email and password not be the empty');

      const user = await UserModel.findOne({
        where: {
          email: LoginUser.email,
        },
      });

      if (!user) throw new NotFoundException('User Not Found with this email');

      const checkPass = await bcrypt.compare(
        LoginUser.password,
        user.dataValues.password,
      );

      if (!checkPass) throw new ConflictException('Incorrect Password');

      const payload = {
        userId: user.dataValues.userId,
        email: user.dataValues.email,
        role: user.dataValues.role,
      };

      const accessToken = await this.jwtService.sign(payload);

      this.logger.info(`Login User: ${user.dataValues.userId}`);

      return {
        user_id: user.dataValues.userId,
        email: user.dataValues.email,
        role: user.dataValues.role,
        accessToken: accessToken,
      };
    } catch (error) {
      this.logger.error(error, 'Error in login');
      throw error;
    }
  }
}
