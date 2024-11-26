import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserServiceMock } from './user.server.mock';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [UserController],
  providers: [UserService, UserServiceMock],
  exports: [UserService],
})
export class UserModule {}