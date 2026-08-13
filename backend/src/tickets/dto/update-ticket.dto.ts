import { TicketStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateTicketDto {
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;
}
