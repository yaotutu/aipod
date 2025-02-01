import { Injectable } from '@nestjs/common';
import { ContentProcessor, ProcessorConfig } from './interfaces/content-processor.interface';
import { BaseProcessor } from './processors/base.processor';
import { CharacterConverterProcessor } from './processors/character-converter.processor';
import { HtmlCleanerProcessor } from './processors/html-cleaner.processor';
import { WhitespaceProcessor } from './processors/whitespace.processor';

/** 处理器构造函数类型定义 */
type ProcessorConstructor = new (options: any) => BaseProcessor;

/**
 * 内容处理服务
 * 负责管理和协调多个内容处理器，实现内容的流水线处理
 */
@Injectable()
export class ContentProcessorService {
    /** 存储已注册的处理器映射 */
    private processors: Map<string, ProcessorConstructor> = new Map();
    /** 当前配置的处理器链 */
    private processorChain: ContentProcessor | null = null;

    constructor() {
        // 注册默认的内容处理器
        this.registerProcessor('htmlCleaner', HtmlCleanerProcessor);
        this.registerProcessor('whitespace', WhitespaceProcessor);
        this.registerProcessor('characterConverter', CharacterConverterProcessor);
    }

    /**
     * 注册新的处理器
     * @param name 处理器名称，用于配置时引用
     * @param processor 处理器类
     */
    registerProcessor(name: string, processor: ProcessorConstructor): void {
        this.processors.set(name, processor);
    }

    /**
     * 配置处理器链
     * 根据提供的配置创建和组装处理器链
     * @param config 处理器配置对象
     */
    configure(config: ProcessorConfig): void {
        this.processorChain = null;
        let lastProcessor: ContentProcessor | null = null;

        // 根据配置创建处理器链
        for (const [name, options] of Object.entries(config)) {
            const ProcessorClass = this.processors.get(name);
            if (!ProcessorClass) {
                continue;
            }

            // 创建处理器实例
            const processor = new ProcessorClass(options);

            // 设置处理器链的头部
            if (!this.processorChain) {
                this.processorChain = processor;
            }

            // 连接处理器
            if (lastProcessor) {
                lastProcessor.setNext(processor);
            }
            lastProcessor = processor;
        }
    }

    /**
     * 处理内容
     * 将内容通过配置好的处理器链进行处理
     * @param content 需要处理的原始内容
     * @returns 处理后的内容
     */
    process(content: string): string {
        if (!this.processorChain) {
            return content;
        }
        return this.processorChain.process(content);
    }
} 