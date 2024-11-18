import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { RegisterUserDto } from './dto/register.dto';
import {
  forgetPasswordWrapper,
  registerWrapper,
  updateEmailWrapper,
} from 'src/config/helper';
import { LoginUserDto } from './dto/login.dto';
import { md5 } from 'src/config/utils';
import { User } from '@prisma/client';
import { UpdatePasswordUserDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  @Inject(PrismaService)
  private prismaService: PrismaService;

  @Inject(RedisService)
  private redisServer: RedisService;

  private logger = new Logger();

  async register({ captcha, ...data }: RegisterUserDto) {
    const cacheCaptcha = await this.redisServer.get(
      registerWrapper(data.email),
    );
    if (!cacheCaptcha) {
      throw new BadRequestException('验证码失效');
    }
    if (captcha !== cacheCaptcha) {
      throw new BadRequestException('验证码错误');
    }

    const foundUser = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });
    if (foundUser) {
      throw new BadRequestException('该邮箱已存在');
    }

    const checkUserName = await this.prismaService.user.findFirst({
      where: { username: data.username },
    });

    if (checkUserName) {
      throw new BadRequestException('用户名不能重复');
    }

    try {
      const user = await this.prismaService.user.create({
        data: { ...data, password: md5(data.password) },
        select: {
          id: true,
          username: true,
          email: true,
          /** 只返回选择的字段 */
        },
      });
      return user;
    } catch (error) {
      this.logger.error(error, UserService);
      throw new InternalServerErrorException('内部错误');
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const foundUser = await this.prismaService.user.findFirst({
      where: {
        username: loginUserDto.username,
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
      },
    });

    if (!foundUser) {
      throw new BadRequestException('用户不存在');
    }

    const { password, ...user } = foundUser;
    if (password !== md5(loginUserDto.password)) {
      throw new BadRequestException('密码错误');
    }

    return user;
  }

  async findUserById(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        nickName: true,
        headPic: true,
        createTime: true,
      },
    });
    return user;
  }

  async updateUser(config: UpdateConfig) {
    switch (config.type) {
      case 'forget-password': {
        const foundUser = await this.prismaService.user.findUnique({
          where: { email: config.data.email },
        });
        if (!foundUser) {
          throw new BadRequestException('邮箱不存在');
        }
        const cacheCaptcha = await this.redisServer.get(
          forgetPasswordWrapper(config.data.email),
        );
        if (!cacheCaptcha) {
          throw new BadRequestException('验证码失效');
        }
        if (cacheCaptcha !== config.captcha) {
          throw new BadRequestException('验证码错误');
        }
        try {
          await this.prismaService.user.update({
            where: { email: config.data.email },
            data: { password: md5(config.data.password) },
          });
        } catch (error) {
          throw new InternalServerErrorException('内部错误');
        }
        break;
      }
      case 'update-password': {
        const foundUser = await this.prismaService.user.findUnique({
          where: { id: config.data.id },
        });
        if (!foundUser) {
          throw new BadRequestException('用户不存在');
        }
        if (md5(config.data.oldPassword) !== foundUser.password) {
          throw new BadRequestException('原密码不正确');
        }
        if (md5(config.data.oldPassword) === md5(config.data.password)) {
          throw new BadRequestException('新密码不能原密码相同');
        }
        try {
          await this.prismaService.user.update({
            where: { id: config.data.id },
            data: { password: md5(config.data.password) },
          });
        } catch (error) {
          throw new InternalServerErrorException('内部错误');
        }
        break;
      }
      case 'update-user': {
        const { nickName, headPic, id } = config.data;
        try {
          await this.prismaService.user.update({
            where: { id },
            data: { nickName, headPic },
          });
        } catch (error) {
          throw new InternalServerErrorException('内部错误');
        }
        break;
      }
      case 'update-email': {
        const foundUser = await this.prismaService.user.findUnique({
          where: { id: config.data.id },
        });
        if (!foundUser) {
          throw new BadRequestException('用户不存在');
        }
        const cacheCaptcha = await this.redisServer.get(
          updateEmailWrapper(config.data.email),
        );
        if (!cacheCaptcha) {
          throw new BadRequestException('验证码失效');
        }
        if (cacheCaptcha !== config.captcha) {
          throw new BadRequestException('验证码错误');
        }
        try {
          await this.prismaService.user.update({
            where: { id: foundUser.id },
            data: { email: config.data.email },
          });
        } catch (error) {
          throw new InternalServerErrorException('内部错误');
        }
      }
    }
  }
}

type UpdateConfig =
  | {
      type: 'forget-password';
      data: Pick<User, 'email' | 'password'>;
      captcha: string;
    }
  | {
      type: 'update-password';
      data: Pick<User, 'id'> & UpdatePasswordUserDto;
    }
  | {
      type: 'update-email';
      data: Pick<User, 'id' | 'email'>;
      captcha: string;
    }
  | {
      type: 'update-user';
      data: Pick<User, 'id' | 'nickName' | 'headPic'>;
    };
