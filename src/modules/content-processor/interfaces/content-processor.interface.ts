/**
 * 内容处理器接口
 * 定义了处理器的基本行为和责任链模式所需的方法
 */
export interface ContentProcessor {
    /**
     * 处理内容的核心方法
     * @param content 需要处理的原始内容
     * @returns 处理后的内容
     */
    process(content: string): string;

    /**
     * 设置责任链中的下一个处理器
     * @param processor 下一个处理器
     * @returns 返回下一个处理器，便于链式调用
     */
    setNext(processor: ContentProcessor): ContentProcessor;
}

/**
 * 处理器配置选项接口
 * 定义了处理器的基本配置结构
 */
export interface ProcessorOptions {
    /** 是否启用该处理器 */
    enabled: boolean;
    /** 允许添加任意其他配置项 */
    [key: string]: any;
}

/**
 * 处理器配置映射接口
 * 用于配置整个处理链中的所有处理器
 * key为处理器名称，value为对应的配置选项
 */
export interface ProcessorConfig {
    [key: string]: ProcessorOptions;
} 