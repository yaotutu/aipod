import { BaseProcessor } from './base.processor';

/**
 * 空白字符处理器的配置选项
 */
export interface WhitespaceOptions {
    /** 是否启用处理器 */
    enabled: boolean;
    /** 是否规范化缩进 */
    normalizeIndentation?: boolean;
    /** 允许的最大连续换行数 */
    maxConsecutiveNewlines?: number;
}

/**
 * 空白字符处理器
 * 负责处理文本中的空白字符，包括空格、换行、缩进等
 */
export class WhitespaceProcessor extends BaseProcessor {
    /**
     * 构造函数
     * @param options 空白字符处理器的配置选项
     */
    constructor(options: WhitespaceOptions = { enabled: true }) {
        super(options);
    }

    /**
     * 处理文本中的空白字符
     * @param content 原始文本内容
     * @returns 处理后的文本内容
     */
    protected processContent(content: string): string {
        let processed = content;

        // 将连续的空白字符替换为单个空格
        processed = processed.replace(/\s+/g, ' ');

        // 处理连续换行，限制最大连续换行数
        const maxNewlines = (this.options as WhitespaceOptions).maxConsecutiveNewlines || 2;
        const newlineRegex = new RegExp(`\n{${maxNewlines + 1},}`, 'g');
        processed = processed.replace(newlineRegex, '\n'.repeat(maxNewlines));

        // 如果启用了缩进规范化，处理每行的缩进
        if ((this.options as WhitespaceOptions).normalizeIndentation) {
            processed = processed
                .split('\n')
                .map(line => line.trim()) // 移除每行开头和结尾的空白字符
                .join('\n');
        }

        return processed;
    }
} 