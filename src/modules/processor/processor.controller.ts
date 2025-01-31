import { Controller, Post, Body } from '@nestjs/common';
import { ProcessorService } from './processor.service';
import { ProcessingOptions, ProcessingResult } from './processor.interface';

@Controller('processor')
export class ProcessorController {
    constructor(private readonly processorService: ProcessorService) { }

    @Post('process')
    async processContent(
        @Body() body: {
            id: string;
            content: string;
            options?: ProcessingOptions;
        }
    ): Promise<ProcessingResult> {
        return this.processorService.processContent(
            body.id,
            body.content,
            body.options
        );
    }
}