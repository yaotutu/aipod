import { BaseProcessor } from './base.processor';

/**
 * 字符转换处理器的配置选项
 */
export interface CharacterConverterOptions {
    /** 是否启用处理器 */
    enabled: boolean;
    /** 是否将全角字符转换为半角 */
    convertFullWidthToHalfWidth?: boolean;
    /** 是否统一引号格式 */
    normalizeQuotes?: boolean;
    /** 是否标准化标点符号 */
    normalizePunctuation?: boolean;
}

/**
 * 字符转换处理器
 * 负责处理文本中的特殊字符，包括全角/半角转换、标点符号标准化等
 */
export class CharacterConverterProcessor extends BaseProcessor {
    /** 全角字符到半角字符的映射表 */
    private readonly fullWidthMap: { [key: string]: string } = {
        '！': '!', '＂': '"', '＃': '#', '＄': '$', '％': '%', '＆': '&', '＇': "'",
        '（': '(', '）': ')', '＊': '*', '＋': '+', '，': ',', '－': '-', '．': '.',
        '／': '/', '：': ':', '；': ';', '＜': '<', '＝': '=', '＞': '>', '？': '?',
        '＠': '@', '［': '[', '＼': '\\', '］': ']', '＾': '^', '＿': '_', '｀': '`',
        '｛': '{', '｜': '|', '｝': '}', '～': '~'
    };

    /**
     * 构造函数
     * @param options 字符转换处理器的配置选项
     */
    constructor(options: CharacterConverterOptions = { enabled: true }) {
        super(options);
    }

    /**
     * 处理文本中的特殊字符
     * @param content 原始文本内容
     * @returns 处理后的文本内容
     */
    protected processContent(content: string): string {
        let processed = content;
        const options = this.options as CharacterConverterOptions;

        // 根据配置选择性执行不同的转换处理
        if (options.convertFullWidthToHalfWidth) {
            processed = this.convertFullWidthToHalfWidth(processed);
        }

        if (options.normalizeQuotes) {
            processed = this.normalizeQuotes(processed);
        }

        if (options.normalizePunctuation) {
            processed = this.normalizePunctuation(processed);
        }

        return processed;
    }

    /**
     * 将全角字符转换为半角字符
     * @param text 包含全角字符的文本
     * @returns 转换后的文本
     */
    private convertFullWidthToHalfWidth(text: string): string {
        return text.split('').map(char => {
            // 处理全角空格
            if (char === '　') return ' ';
            // 处理全角字符
            if (char in this.fullWidthMap) return this.fullWidthMap[char];
            // 处理全角数字和字母
            const code = char.charCodeAt(0);
            if (code >= 0xFF01 && code <= 0xFF5E) {
                return String.fromCharCode(code - 0xFEE0);
            }
            return char;
        }).join('');
    }

    /**
     * 统一引号格式
     * @param text 包含各种引号的文本
     * @returns 统一引号后的文本
     */
    private normalizeQuotes(text: string): string {
        return text
            .replace(/[""]/g, '"')  // 统一中文双引号
            .replace(/['']/g, "'"); // 统一中文单引号
    }

    /**
     * 标准化标点符号
     * @param text 包含各种标点符号的文本
     * @returns 标准化后的文本
     */
    private normalizePunctuation(text: string): string {
        return text
            .replace(/[、，]/g, ',')   // 统一逗号
            .replace(/[。．]/g, '.')   // 统一句号
            .replace(/[！]/g, '!')     // 统一感叹号
            .replace(/[？]/g, '?')     // 统一问号
            .replace(/[：]/g, ':')     // 统一冒号
            .replace(/[；]/g, ';')     // 统一分号
            .replace(/[（]/g, '(')     // 统一左括号
            .replace(/[）]/g, ')');    // 统一右括号
    }
} 