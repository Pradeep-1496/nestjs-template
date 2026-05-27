import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateUserRoleDto } from './dto/user-role.dto';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/shared/guards/auth.guard';
import { RolesGuard } from 'src/common/shared/guards/roles.guard';
import { Roles } from '../../common/shared/decorators/roles.decorator';
import { CurrentUser } from 'src/common/shared/decorators/current-user.decorator';

@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // admin
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  @ApiOperation({
    summary: 'All User',
    description: 'admin can get all users',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  @ApiOperation({
    summary: 'Assign User Role',
    description: 'admin can assign role to any users',
  })
  assignRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.assignRole(id, updateRoleDto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  @ApiOperation({
    summary: 'Delete User',
    description: 'admin can delete any users',
  })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user);
  }

  // Common
  @Patch()
  @ApiOperation({
    summary: 'Update User',
    description: 'any user can update their name or password',
  })
  update(@Body() updateUserDto: UpdateUserDto, @CurrentUser() user: any) {
    return this.usersService.update(updateUserDto, user);
  }
}
