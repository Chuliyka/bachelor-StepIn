import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('map')
@UseGuards(JwtAuthGuard)
export class MapController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  findMapUsers(@Req() req: { user: { id: number } }) {
    return this.usersService.findForMap(req.user.id);
  }
}
