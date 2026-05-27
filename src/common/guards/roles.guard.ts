import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { UserModel } from 'src/common/models/user.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    const userInfo: any = await UserModel.findByPk(user.userId);

    return await requiredRoles.some((role) =>
      userInfo.dataValues.role?.includes(role),
    );
  }
}

/*


  const { userFromToken } = context.switchToHttp().getRequest();

    const user = await UserModel.findByPk(userFromToken.userId);

    console.log(
      '\n\n++++++++++++===+++',
      user,
      '\n------',
      requiredRoles.some((role) => user?.dataValues.role?.includes(role)),
    );


*/
