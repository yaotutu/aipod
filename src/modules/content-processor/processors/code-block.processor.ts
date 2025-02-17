import * as cheerio from 'cheerio';
import { Element } from 'domhandler';
import { BaseProcessor } from './base.processor';

/**
 * 代码块处理器的配置选项
 * TODO: 
 * - [ ] 添加代码高亮信息提取
 * - [ ] 支持更多编程语言的识别
 * - [ ] 添加代码复杂度评估
 * - [ ] 支持自定义代码描述模板
 */
export interface CodeBlockOptions {
    /** 是否启用处理器 */
    enabled?: boolean;
    /** 是否移除代码内容 */
    removeCode?: boolean;
    /** 是否保留代码说明文本 */
    preserveDescription?: boolean;
    /** 是否添加代码概要 */
    addCodeSummary?: boolean;
    /** 需要处理的代码块标签 */
    codeBlockTags?: string[];
    /** 代码描述模板 */
    descriptionTemplate?: string;
}

/**
 * 代码块处理器
 * 负责处理文本中的代码块，可以选择移除或简化代码示例
 * TODO: 
 * - [ ] 优化语言检测算法
 * - [ ] 添加代码注释的智能提取
 * - [ ] 支持代码片段的语义分析
 * - [ ] 实现代码依赖关系识别
 */
export class CodeBlockProcessor extends BaseProcessor {
    // TODO: 扩展支持更多代码块标签
    protected defaultCodeBlockTags = ['pre code'];
    protected defaultTemplate = '[这是一段{language}代码，{summary}]';

    constructor(options: CodeBlockOptions = {}) {
        super(options);
    }

    protected processContent(content: string): string {
        const $ = cheerio.load(content, {
            xml: true,
            decodeEntities: false
        } as cheerio.CheerioOptions);

        const options = this.options as CodeBlockOptions;
        const codeBlockTags = options.codeBlockTags || this.defaultCodeBlockTags;
        const template = options.descriptionTemplate || this.defaultTemplate;

        codeBlockTags.forEach(tag => {
            $(tag).each((_, element) => {
                if (element.type === 'tag') {
                    const $element = $(element);
                    const language = this.detectLanguage($element);
                    const code = $element.text().trim();

                    if (options.removeCode) {
                        const summary = this.generateCodeSummary(code, language);
                        const description = template
                            .replace('{language}', language ? language.toLowerCase() : '未知语言')
                            .replace('{summary}', summary);

                        if (tag === 'code') {
                            $element.replaceWith(description);
                        } else {
                            $element.parent().replaceWith(description);
                        }
                    }
                }
            });
        });

        return $.html().trim();
    }

    /**
     * 检测代码语言
     * TODO: 
     * - [ ] 添加更多语言特征识别
     * - [ ] 实现机器学习模型辅助识别
     * - [ ] 支持混合语言代码识别
     */
    protected detectLanguage($element: cheerio.Cheerio<Element>): string {
        const classAttr = $element.attr('class') || '';
        const match = classAttr.match(/language-(\w+)/);
        if (match) {
            return match[1];
        }

        const dataLang = $element.attr('data-language');
        if (dataLang) {
            return dataLang;
        }

        return '';
    }

    /**
     * 根据代码特征推测语言
     * TODO: 
     * - [ ] 添加更多语言的特征识别
     * - [ ] 实现基于统计的语言识别
     * - [ ] 支持自定义语言特征配置
     */
    private guessLanguage(code: string): string {
        if (code.includes('def ') || code.includes('print(')) {
            return 'Python';
        }
        if (code.includes('function ') || code.includes('var ') || code.includes('const ')) {
            return 'JavaScript';
        }
        if (code.includes('public class ') || code.includes('System.out.println')) {
            return 'Java';
        }
        return '未知语言';
    }

    /**
     * 生成代码概要
     * TODO: 
     * - [ ] 实现更智能的代码分析
     * - [ ] 添加代码功能描述生成
     * - [ ] 支持多语言代码概要模板
     */
    protected generateCodeSummary(code: string, language: string): string {
        // 移除注释
        code = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

        // 函数定义检测
        if (code.includes('function') || code.includes('def ') ||
            code.includes('=>') || code.includes('fn ')) {
            return '定义了函数';
        }

        // 类定义检测
        if (code.includes('class ')) {
            return '定义了类';
        }

        // 导入语句检测
        if (code.includes('import ') || code.includes('require')) {
            return '包含依赖导入';
        }

        // 输出语句检测
        if (code.includes('console.log') || code.includes('print')) {
            return '包含输出语句';
        }

        return '包含代码片段';
    }
} 