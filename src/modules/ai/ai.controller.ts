import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ContentSummaryRequest, AIProcessingResult } from './ai.interface';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('summarize')
    async summarizeContent(
        @Body() request: ContentSummaryRequest
    ): Promise<AIProcessingResult> {
        return this.aiService.summarizeContent(request);
    }
}