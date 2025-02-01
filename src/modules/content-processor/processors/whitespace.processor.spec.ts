import { WhitespaceProcessor } from './whitespace.processor';

describe('WhitespaceProcessor', () => {
    let processor: WhitespaceProcessor;

    describe('基础功能', () => {
        it('当处理器禁用时应返回原始内容', () => {
            processor = new WhitespaceProcessor({ enabled: false });
            const input = '  多余的空格  \n\n\n';
            expect(processor.process(input)).toBe('  多余的空格  \n\n\n');
        });

        it('当所有选项都为false时应返回原始内容', () => {
            processor = new WhitespaceProcessor({
                enabled: true,
                normalizeIndentation: false,
                maxConsecutiveNewlines: undefined
            });
            const input = '  多余的空格  \n\n\n';
            expect(processor.process(input)).toBe(' 多余的空格 ');
        });
    });

    describe('空格处理', () => {
        beforeEach(() => {
            processor = new WhitespaceProcessor({ enabled: true });
        });

        it('应该将连续空格替换为单个空格', () => {
            const input = '这里    有很多    空格';
            expect(processor.process(input)).toBe('这里 有很多 空格');
        });

        it('应该处理制表符', () => {
            const input = '这里\t有\t制表符';
            expect(processor.process(input)).toBe('这里 有 制表符');
        });
    });

    describe('缩进处理', () => {
        it('应该规范化缩进', () => {
            processor = new WhitespaceProcessor({
                enabled: true,
                normalizeIndentation: true
            });
            const input = `
                第一行
                    第二行
                        第三行
            `;
            expect(processor.process(input)).toBe('第一行 第二行 第三行');
        });

        it('当禁用缩进规范化时应保留缩进', () => {
            processor = new WhitespaceProcessor({
                enabled: true,
                normalizeIndentation: false
            });
            const input = '    缩进的文本';
            expect(processor.process(input)).toBe(' 缩进的文本');
        });
    });

    describe('混合处理', () => {
        beforeEach(() => {
            processor = new WhitespaceProcessor({
                enabled: true,
                normalizeIndentation: true
            });
        });

        it('应该能同时处理多种情况', () => {
            const input = `
                第一段    文本
                    第二段    文本
            `;
            expect(processor.process(input)).toBe('第一段 文本 第二段 文本');
        });
    });

    describe('特殊情况', () => {
        beforeEach(() => {
            processor = new WhitespaceProcessor({ enabled: true });
        });

        it('应该处理空字符串', () => {
            expect(processor.process('')).toBe('');
        });

        it('应该处理只包含空白字符的字符串', () => {
            expect(processor.process('   \n\t   \n   ')).toBe(' ');
        });
    });
}); 