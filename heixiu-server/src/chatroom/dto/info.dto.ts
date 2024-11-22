import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChatroomMemberInfoDto {
  @IsNumber({}, { message: '聊天室id必须是数字' })
  @Transform((params) => Number(params.value))
  @IsNotEmpty({
    message: '聊天室id不能为空',
  })
  id: number;
}