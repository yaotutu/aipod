import { FormulaProcessor } from './formula.processor';

describe('FormulaProcessor', () => {
    let processor: FormulaProcessor;

    beforeEach(() => {
        processor = new FormulaProcessor({
            enabled: true,
            processLatex: true,
            processMathML: true,
            addDescription: true
        });
    });

    describe('基础功能', () => {
        it('当处理器禁用时应返回原始内容', () => {
            processor = new FormulaProcessor({ enabled: false });
            const input = '\\[E = mc^2\\]';
            expect(processor.process(input)).toBe(input);
        });

        it('当processLatex为false时应保留LaTeX公式', () => {
            processor = new FormulaProcessor({
                enabled: true,
                processLatex: false
            });
            const input = '\\[E = mc^2\\]';
            expect(processor.process(input)).toBe(input);
        });

        it('当processMathML为false时应保留MathML公式', () => {
            processor = new FormulaProcessor({
                enabled: true,
                processMathML: false
            });
            const input = '<math><mi>E</mi><mo>=</mo><mi>m</mi><msup><mi>c</mi><mn>2</mn></msup></math>';
            expect(processor.process(input)).toBe(input);
        });
    });

    describe('LaTeX公式处理', () => {
        beforeEach(() => {
            processor = new FormulaProcessor({
                enabled: true,
                processLatex: true,
                addDescription: true
            });
        });

        it('应该能处理行内LaTeX公式', () => {
            const input = '\\(a+b=c\\)';
            expect(processor.process(input)).toBe('[数学公式: a+b=c]');
        });

        it('应该能处理块级LaTeX公式', () => {
            const input = '\\[\\int_0^\\infty e^{-x} dx\\]';
            expect(processor.process(input)).toBe('[数学公式: ∫_0^∞ e^-x dx]');
        });
    });

    describe('MathML公式处理', () => {
        beforeEach(() => {
            processor = new FormulaProcessor({
                enabled: true,
                processMathML: true,
                addDescription: true
            });
        });

        it('应该能处理简单MathML公式', () => {
            const input = '<math><mi>x</mi><mo>+</mo><mi>y</mi></math>';
            expect(processor.process(input)).toBe('[数学公式: x+y]');
        });

        it('应该能处理复杂MathML公式', () => {
            const input = '<math><mrow><mi>a</mi><mo>+</mo><mfrac><mi>b</mi><mi>c</mi></mfrac><mo>+</mo><mi>d</mi></mrow></math>';
            expect(processor.process(input)).toBe('[数学公式: a+bc+d]');
        });
    });

    describe('公式简化', () => {
        beforeEach(() => {
            processor = new FormulaProcessor({
                enabled: true,
                processLatex: true,
                addDescription: true
            });
        });

        it('应该能简化分数', () => {
            const input = '\\[\\frac{a+b}{c+d}\\]';
            expect(processor.process(input)).toBe('[数学公式: a+b/c+d]');
        });

        it('应该能简化上下标', () => {
            const input = '\\[x^2_n + y^{a+b}\\]';
            expect(processor.process(input)).toBe('[数学公式: x^2_n + y^a+b]');
        });
    });

    describe('特殊情况', () => {
        beforeEach(() => {
            processor = new FormulaProcessor({ enabled: true });
        });

        it('应该处理空字符串', () => {
            expect(processor.process('')).toBe('');
        });

        it('应该处理不包含公式的文本', () => {
            const input = '这是一段普通文本';
            expect(processor.process(input)).toBe('这是一段普通文本');
        });
    });

    describe('自定义配置', () => {
        it('应该支持自定义公式模式', () => {
            processor = new FormulaProcessor({
                enabled: true,
                formulaPatterns: {
                    latex: /\$\$(.*?)\$\$/gs
                }
            });
            const input = '$$E=mc^2$$';
            expect(processor.process(input)).toBe('[质能方程 E=mc²]');
        });

        it('应该支持自定义公式映射', () => {
            processor = new FormulaProcessor({
                enabled: true,
                commonFormulas: {
                    'F=ma': '牛顿第二定律'
                }
            });
            const input = '\\[F=ma\\]';
            expect(processor.process(input)).toBe('[牛顿第二定律]');
        });
    });
}); 