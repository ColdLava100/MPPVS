import { IsString, IsArray, ArrayMinSize, IsOptional } from 'class-validator';

export class SubmitVoteDto {
  @IsString()
  electionId: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  candidateIds: string[];

  @IsOptional()
  @IsString()
  simulatedVoterId?: string;
}
