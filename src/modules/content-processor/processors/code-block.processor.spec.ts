import { CodeBlockProcessor } from './code-block.processor';

describe('CodeBlockProcessor', () => {
    let processor: CodeBlockProcessor;

    beforeEach(() => {
        processor = new CodeBlockProcessor({
            enabled: true,
            removeCode: true,
            addCodeSummary: true
        });
    });

    describe('基础功能', () => {
        it('当处理器禁用时应返回原始内容', () => {
            processor = new CodeBlockProcessor({ enabled: false });
            const input = '<pre><code>test</code></pre>';
            expect(processor.process(input)).toBe(input);
        });

        it('当removeCode为false时应保留原始代码', () => {
            processor = new CodeBlockProcessor({
                enabled: true,
                removeCode: false
            });
            const input = '<pre><code>console.log("test");</code></pre>';
            expect(processor.process(input)).toBe(input);
        });

        it('应该能处理空代码块', () => {
            const input = '<pre><code></code></pre>';
            expect(processor.process(input)).toBe('[这是一段未知语言代码，包含代码片段]');
        });

        it('应该能处理包含HTML实体的代码', () => {
            const input = '<pre><code>&lt;div&gt;test&lt;/div&gt;</code></pre>';
            expect(processor.process(input)).toBe('[这是一段未知语言代码，包含代码片段]');
        });
    });

    describe('语言检测', () => {
        it('应该能处理Python代码块', () => {
            const input = '<pre><code class="language-python">def hello_world():\n    print("Hello, World!")</code></pre>';
            expect(processor.process(input)).toBe('[这是一段python代码，定义了函数]');
        });

        it('应该能处理JavaScript代码块', () => {
            const input = '<pre><code class="language-javascript">function sum(a, b) {\n    return a + b;\n}</code></pre>';
            expect(processor.process(input)).toBe('[这是一段javascript代码，定义了函数]');
        });

        it('应该能处理Java代码块', () => {
            const input = '<pre><code class="language-java">public class Test {\n    public static void main(String[] args) {}\n}</code></pre>';
            expect(processor.process(input)).toBe('[这是一段java代码，定义了类]');
        });

        it('应该能处理无语言标记的代码块', () => {
            const input = '<pre><code>console.log("test");</code></pre>';
            expect(processor.process(input)).toBe('[这是一段未知语言代码，包含输出语句]');
        });

        it('应该能处理自定义语言标记', () => {
            const input = '<pre><code data-language="rust">fn main() {}</code></pre>';
            expect(processor.process(input)).toBe('[这是一段rust代码，定义了函数]');
        });
    });

    describe('代码分析', () => {
        it('应该能识别函数定义', () => {
            const cases = [
                {
                    input: '<pre><code>function test() {}</code></pre>',
                    expected: '[这是一段未知语言代码，定义了函数]'
                },
                {
                    input: '<pre><code>def test():</code></pre>',
                    expected: '[这是一段未知语言代码，定义了函数]'
                },
                {
                    input: '<pre><code>const test = () => {}</code></pre>',
                    expected: '[这是一段未知语言代码，定义了函数]'
                }
            ];

            cases.forEach(({ input, expected }) => {
                expect(processor.process(input)).toBe(expected);
            });
        });

        it('应该能识别类定义', () => {
            const cases = [
                {
                    input: '<pre><code>class Test {}</code></pre>',
                    expected: '[这是一段未知语言代码，定义了类]'
                },
                {
                    input: '<pre><code>class Test extends Base {}</code></pre>',
                    expected: '[这是一段未知语言代码，定义了类]'
                }
            ];

            cases.forEach(({ input, expected }) => {
                expect(processor.process(input)).toBe(expected);
            });
        });

        it('应该能识别导入语句', () => {
            const cases = [
                {
                    input: '<pre><code>import { test } from "module";</code></pre>',
                    expected: '[这是一段未知语言代码，包含依赖导入]'
                },
                {
                    input: '<pre><code>const module = require("module");</code></pre>',
                    expected: '[这是一段未知语言代码，包含依赖导入]'
                }
            ];

            cases.forEach(({ input, expected }) => {
                expect(processor.process(input)).toBe(expected);
            });
        });

        it('应该能识别输出语句', () => {
            const cases = [
                {
                    input: '<pre><code>console.log("test");</code></pre>',
                    expected: '[这是一段未知语言代码，包含输出语句]'
                },
                {
                    input: '<pre><code>print("test")</code></pre>',
                    expected: '[这是一段未知语言代码，包含输出语句]'
                }
            ];

            cases.forEach(({ input, expected }) => {
                expect(processor.process(input)).toBe(expected);
            });
        });
    });

    describe('多代码块处理', () => {
        it('应该能处理多个代码块', () => {
            const input = `
                <pre><code class="language-python">print("Hello")</code></pre>
                <pre><code class="language-javascript">console.log("World")</code></pre>
            `;
            const result = processor.process(input);
            expect(result).toContain('[这是一段python代码，包含输出语句]');
            expect(result).toContain('[这是一段javascript代码，包含输出语句]');
        });

        it('应该能处理嵌套的代码块', () => {
            const input = `
                <pre><code class="language-html">
                    <pre><code class="language-javascript">
                        console.log("test");
                    </code></pre>
                </code></pre>
            `;
            const result = processor.process(input);
            expect(result).toContain('[这是一段html代码，包含输出语句]');
        });
    });

    describe('自定义配置', () => {
        it('应该支持自定义代码块标签', () => {
            processor = new CodeBlockProcessor({
                enabled: true,
                removeCode: true,
                codeBlockTags: ['code']
            });
            const input = '<code>test</code>';
            expect(processor.process(input)).toBe('[这是一段未知语言代码，包含代码片段]');
        });

        it('应该支持自定义描述模板', () => {
            processor = new CodeBlockProcessor({
                enabled: true,
                removeCode: true,
                descriptionTemplate: '代码{language}: {summary}'
            });
            const input = '<pre><code class="language-python">print("test")</code></pre>';
            expect(processor.process(input)).toBe('代码python: 包含输出语句');
        });
    });
}); 