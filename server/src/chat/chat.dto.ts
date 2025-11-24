import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinDto {
  @ApiProperty({
    example: 'Sergey',
    description: 'Username, unique within the room',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    example: 'general',
    description: 'Chat room ID',
  })
  @IsString()
  @IsNotEmpty()
  roomId!: string;
}

export class SendMessageDto {
  @ApiProperty({
    example: 'general',
    description: 'Chat room ID',
  })
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @ApiProperty({
    example: 'Hello world',
    description: 'Message',
  })
  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class LeaveDto {
  @ApiProperty({
    example: 'general',
    description: 'The ID of the room we are leaving from',
  })
  @IsString()
  @IsNotEmpty()
  roomId!: string;
}

export class TypingDto {
  @ApiProperty({
    example: 'general',
    description: 'Chat room ID',
  })
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @ApiProperty({
    example: true,
    description: 'Indicates that the user is currently typing.',
  })
  @IsBoolean()
  isTyping!: boolean;
}
