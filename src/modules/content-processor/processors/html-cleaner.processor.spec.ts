import { HtmlCleanerProcessor } from './html-cleaner.processor';

describe('HtmlCleanerProcessor', () => {
    let processor: HtmlCleanerProcessor;

    describe('基础功能', () => {
        it('当处理器禁用时应返回原始内容', () => {
            processor = new HtmlCleanerProcessor({ enabled: false });
            const input = '<script>alert(1)</script><p>内容</p>';
            expect(processor.process(input)).toBe('<script>alert(1)</script><p>内容</p>');
        });

        it('当未指定移除和保留标签时应使用默认值', () => {
            processor = new HtmlCleanerProcessor({ enabled: true });
            const input = '<script>alert(1)</script><style>.test{}</style><p>内容</p>';
            expect(processor.process(input).replace(/\s+/g, '')).toBe('内容');
        });
    });

    describe('标签移除', () => {
        beforeEach(() => {
            processor = new HtmlCleanerProcessor({
                enabled: true,
                removeElements: ['script', 'style', 'custom']
            });
        });

        it('应该移除指定的标签', () => {
            const input = `
                <div>
                    <script>alert(1)</script>
                    <style>.test{}</style>
                    <custom>自定义标签</custom>
                    <p>内容</p>
                </div>
            `;
            expect(processor.process(input).replace(/\s+/g, '')).toBe('内容');
        });

        it('应该保留未指定移除的标签的内容', () => {
            const input = '<div><p>这个也保留</p></div>';
            expect(processor.process(input).replace(/\s+/g, '')).toBe('这个也保留');
        });
    });

    describe('标签保留', () => {
        beforeEach(() => {
            processor = new HtmlCleanerProcessor({
                enabled: true,
                preserveElements: ['p', 'div', 'span']
            });
        });

        it('应该保留指定的标签的内容', () => {
            const input = `
                <div>
                    <p>段落</p>
                    <span>行内文本</span>
                    <custom>自定义标签</custom>
                </div>
            `;
            expect(processor.process(input).replace(/\s+/g, '')).toBe('段落行内文本自定义标签');
        });

        it('应该保留嵌套的标签的内容', () => {
            const input = '<div><p><span>嵌套内容</span></p></div>';
            expect(processor.process(input).replace(/\s+/g, '')).toBe('嵌套内容');
        });
    });

    describe('混合处理', () => {
        beforeEach(() => {
            processor = new HtmlCleanerProcessor({
                enabled: true,
                removeElements: ['script', 'style'],
                preserveElements: ['p', 'div', 'span']
            });
        });

        it('应该能同时处理移除和保留标签', () => {
            const input = `
                <div>
                    <script>alert(1)</script>
                    <p>段落内容</p>
                    <custom>自定义内容</custom>
                    <span>行内内容</span>
                </div>
            `;
            expect(processor.process(input).replace(/\s+/g, '')).toBe('段落内容自定义内容行内内容');
        });

        it('应该正确处理属性', () => {
            const input = '<div class="test"><p id="p1">内容</p><span style="color: red;">样式</span></div>';
            expect(processor.process(input).replace(/\s+/g, '')).toBe('内容样式');
        });
    });

    describe('特殊情况', () => {
        beforeEach(() => {
            processor = new HtmlCleanerProcessor({ enabled: true });
        });

        it('应该处理空字符串', () => {
            expect(processor.process('')).toBe('');
        });

        it('应该处理不包含HTML的文本', () => {
            const input = '这是一段普通文本';
            expect(processor.process(input)).toBe('这是一段普通文本');
        });
    });
}); 