import { ContentProcessor, ProcessorOptions } from '../interfaces/content-processor.interface';

/**
 * 内容处理器的抽象基类
 * 实现了责任链模式的基本框架和通用逻辑
 */
export abstract class BaseProcessor implements ContentProcessor {
    /** 责任链中的下一个处理器 */
    protected nextProcessor: ContentProcessor | null = null;
    /** 当前处理器的配置选项 */
    protected options: ProcessorOptions;

    /**
     * 构造函数
     * @param options 处理器配置选项，默认启用处理器
     */
    constructor(options: ProcessorOptions = { enabled: true }) {
        this.options = options;
    }

    /**
     * 设置责任链中的下一个处理器
     * @param processor 下一个处理器实例
     * @returns 返回下一个处理器，便于链式调用
     */
    setNext(processor: ContentProcessor): ContentProcessor {
        this.nextProcessor = processor;
        return processor;
    }

    /**
     * 处理内容的公共方法
     * 实现了处理器的启用/禁用逻辑和责任链的传递
     * @param content 需要处理的内容
     * @returns 处理后的内容
     */
    process(content: string): string {
        // 如果处理器被禁用，直接传递给下一个处理器
        if (!this.options.enabled) {
            return this.nextProcessor ? this.nextProcessor.process(content) : content;
        }

        // 处理当前内容
        const processedContent = this.processContent(content);
        // 传递给下一个处理器
        return this.nextProcessor ? this.nextProcessor.process(processedContent) : processedContent;
    }

    /**
     * 具体的内容处理方法
     * 由子类实现具体的处理逻辑
     * @param content 需要处理的内容
     * @returns 处理后的内容
     */
    protected abstract processContent(content: string): string;
} 