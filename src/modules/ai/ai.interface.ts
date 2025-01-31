export type AIModelName = string;

export interface AIModelConfig {
    modelName: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}

export interface ContentSummaryRequest {
    id: string;
    title: string;
    content: string;
    options?: SummaryOptions;
}

export interface SummaryOptions {
    maxLength?: number;
    format?: 'short' | 'detailed' | 'bullet-points';
    language?: 'zh' | 'en';
    includeTags?: boolean;
    includeTopics?: boolean;
}

export interface ContentSummaryResult {
    id: string;
    originalTitle: string;
    summary: string;
    keyPoints?: string[];
    tags?: string[];
    topics?: string[];
    language: string;
    tokenCount: number;
    processingTime: number;
}

export interface AIProcessingResult {
    success: boolean;
    result?: ContentSummaryResult;
    error?: string;
}

export interface PromptTemplate {
    name: string;
    template: string;
    description?: string;
    variables: string[];
    defaultOptions?: Record<string, any>;
}

export interface AIServiceConfig {
    apiKey: string;
    apiEndpoint?: string;
    defaultModel: AIModelName;
    defaultLanguage: 'zh' | 'en';
    maxRetries: number;
    timeoutMs: number;
    defaultPrompts: PromptTemplate[];
}

export const OPENAI_MODELS = {
    GPT_3_5_TURBO: 'gpt-3.5-turbo',
    GPT_4: 'gpt-4',
} as const;