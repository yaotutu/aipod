import { CharacterConverterProcessor } from './character-converter.processor';

describe('CharacterConverterProcessor', () => {
    let processor: CharacterConverterProcessor;

    beforeEach(() => {
        processor = new CharacterConverterProcessor({
            enabled: true,
            convertFullWidthToHalfWidth: true,
            normalizeQuotes: true,
            normalizePunctuation: true
        });
    });

    describe('基础功能', () => {
        it('当处理器禁用时应返回原始内容', () => {
            processor = new CharacterConverterProcessor({ enabled: false });
            const input = 'ｈｅｌｌｏ，ｗｏｒｌｄ！';
            expect(processor.process(input)).toBe(input);
        });

        it('当所有转换选项都为false时应返回原始内容', () => {
            processor = new CharacterConverterProcessor({
                enabled: true,
                convertFullWidthToHalfWidth: false,
                normalizeQuotes: false,
                normalizePunctuation: false
            });
            const input = 'ｈｅｌｌｏ，ｗｏｒｌｄ！';
            expect(processor.process(input)).toBe(input);
        });
    });

    describe('全角转半角', () => {
        beforeEach(() => {
            processor = new CharacterConverterProcessor({
                enabled: true,
                convertFullWidthToHalfWidth: true
            });
        });

        it('应该能转换全角英文字母', () => {
            const input = 'ＡＢＣａｂｃ';
            expect(processor.process(input)).toBe('ABCabc');
        });

        it('应该能转换全角数字', () => {
            const input = '１２３４５６７８９０';
            expect(processor.process(input)).toBe('1234567890');
        });

        it('应该能转换全角空格', () => {
            const input = 'hello　world';
            expect(processor.process(input)).toBe('hello world');
        });

        it('应该能转换全角标点', () => {
            const input = '！＂＃＄％＆＇（）＊＋，－．／';
            expect(processor.process(input)).toBe('!"#$%&\'()*+,-./');
        });
    });

    describe('引号标准化', () => {
        beforeEach(() => {
            processor = new CharacterConverterProcessor({
                enabled: true,
                normalizeQuotes: true
            });
        });

        it('应该能统一中文双引号', () => {
            const input = '"测试"';
            expect(processor.process(input)).toBe('"测试"');
        });

        it('应该能统一中文单引号', () => {
            const input = "'测试'";
            expect(processor.process(input)).toBe("'测试'");
        });
    });

    describe('标点符号标准化', () => {
        beforeEach(() => {
            processor = new CharacterConverterProcessor({
                enabled: true,
                normalizePunctuation: true
            });
        });

        it('应该能标准化中文标点', () => {
            const cases = [
                {
                    input: '你好，世界。',
                    expected: '你好,世界.'
                },
                {
                    input: '测试！问题？',
                    expected: '测试!问题?'
                },
                {
                    input: '第一；第二：',
                    expected: '第一;第二:'
                },
                {
                    input: '（测试）',
                    expected: '(测试)'
                }
            ];

            cases.forEach(({ input, expected }) => {
                expect(processor.process(input)).toBe(expected);
            });
        });

        it('应该能处理连续标点', () => {
            const input = '你好！！！？？';
            expect(processor.process(input)).toBe('你好!!!??');
        });
    });

    describe('混合处理', () => {
        beforeEach(() => {
            processor = new CharacterConverterProcessor({
                enabled: true,
                convertFullWidthToHalfWidth: true,
                normalizeQuotes: true,
                normalizePunctuation: true
            });
        });

        it('应该能同时处理多种类型的字符', () => {
            const input = 'Ｈｅｌｌｏ，Ｗｏｒｌｄ！　"测试"';
            expect(processor.process(input)).toBe('Hello,World! "测试"');
        });

        it('应该保留不需要转换的字符', () => {
            const input = '这是一段中文和English混合的文本123';
            expect(processor.process(input)).toBe('这是一段中文和English混合的文本123');
        });
    });
}); 