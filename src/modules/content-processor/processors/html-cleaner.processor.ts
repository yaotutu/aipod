import * as cheerio from 'cheerio';
import { BaseProcessor } from './base.processor';

/**
 * HTML清理处理器的配置选项
 */
export interface HtmlCleanerOptions {
    /** 是否启用处理器 */
    enabled: boolean;
    /** 需要移除的HTML标签列表 */
    removeElements?: string[];
    /** 需要保留的HTML标签列表 */
    preserveElements?: string[];
}

/**
 * HTML清理处理器
 * 负责清理和规范化HTML内容，移除不必要的标签，保留有意义的格式
 */
export class HtmlCleanerProcessor extends BaseProcessor {
    /** 默认需要移除的HTML标签 */
    private readonly defaultRemoveElements = ['script', 'style', 'iframe', 'form', 'noscript'];
    /** 默认需要保留的HTML标签 */
    private readonly defaultPreserveElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img'];

    /**
     * 构造函数
     * @param options HTML清理器的配置选项
     */
    constructor(options: HtmlCleanerOptions = { enabled: true }) {
        super(options);
    }

    /**
     * 处理HTML内容
     * @param content 包含HTML标签的原始内容
     * @returns 清理后的HTML内容
     */
    protected processContent(content: string): string {
        // 使用cheerio加载HTML内容
        const $ = cheerio.load(content);

        // 获取配置的移除和保留标签列表，如果未配置则使用默认值
        const removeElements = (this.options as HtmlCleanerOptions).removeElements || this.defaultRemoveElements;
        const preserveElements = (this.options as HtmlCleanerOptions).preserveElements || this.defaultPreserveElements;

        // 移除不需要的元素
        removeElements.forEach(tag => {
            $(tag).remove();
        });

        // 遍历所有元素，只保留指定的HTML标签
        $('*').each((_, element) => {
            if (element.type === 'tag') {
                const tagName = element.name;
                // 如果标签不在保留列表中，则只保留其文本内容
                if (!preserveElements.includes(tagName)) {
                    $(element).replaceWith($(element).text());
                }
            }
        });

        // 返回处理后的HTML字符串
        return $.html();
    }
} 