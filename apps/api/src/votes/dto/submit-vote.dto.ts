import { IsString, IsArray, ArrayMinSize } from 'class-validator';

export class SubmitVoteDto {
  @IsString()
  electionId: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  candidateIds: string[];
}
