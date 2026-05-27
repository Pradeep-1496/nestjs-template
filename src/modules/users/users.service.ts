import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserModel } from 'src/common/models/user.model';
import * as bcrypt from 'bcrypt';
import { UpdateUserRoleDto } from './dto/user-role.dto';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class UsersService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(UsersService.name);
  }

  // Admin
  async findAll() {
    try {
      this.logger.info('Admin fetch all users');

      return await UserModel.findAll();
    } catch (error) {
      this.logger.error(error, 'Error while Admin fetch all users');
      throw error;
    }
  }

  // Common for all users
  async update(updateUserDto: UpdateUserDto, currentUser: any) {
    try {
      if (updateUserDto.currentPassword === updateUserDto.password)
        throw new ConflictException('Cant Set new password as same');

      const user = await UserModel.findByPk(currentUser.userId);

      const payload: any = {};

      if (updateUserDto.name) payload.name = updateUserDto.name;

      if (updateUserDto.password && updateUserDto.currentPassword) {
        const checkPass = await bcrypt.compare(
          updateUserDto.currentPassword,
          user?.dataValues.password,
        );

        if (!checkPass) throw new ConflictException('Incorrect Password');

        const hashPassword = await bcrypt.hash(updateUserDto.password, 10);

        payload.password = hashPassword;
      }

      this.logger.info({ ...currentUser, ...payload }, 'update users');

      return await user?.update(payload);
    } catch (error) {
      this.logger.error(error, 'Erron in update users');

      throw error;
    }
  }

  // Admin
  async assignRole(
    id: string,
    updateRole: UpdateUserRoleDto,
    currentUser: any,
  ) {
    try {
      if (id.length !== 36)
        throw new ConflictException('Id length must be equal to 36');

      if (id === currentUser.userId)
        throw new ConflictException('Cant update self role');

      const updateUser = await UserModel.findByPk(id);

      if (!updateUser)
        throw new NotFoundException(
          'User not found that you want to update role',
        );

      if (updateRole.role) {
        this.logger.info({ id, updateRole }, 'update users role');

        return await updateUser?.update({
          role: updateRole.role,
        });
      }

      this.logger.info({ id, updateRole }, 'remove users role');

      return await updateUser?.update({
        role: null,
      });
    } catch (error) {
      this.logger.error(error, 'Error in assign user role');

      throw error;
    }
  }

  // Admin
  async remove(id: string, currentUser: any) {
    try {
      if (id === currentUser.userId)
        throw new ConflictException('Cant update self role');

      const removeUser = await UserModel.findByPk(id);

      this.logger.info({ id }, 'remove users ');

      return await removeUser?.destroy();
    } catch (error) {
      this.logger.error({ id }, 'Error in removing user');

      throw error;
    }
  }
}
