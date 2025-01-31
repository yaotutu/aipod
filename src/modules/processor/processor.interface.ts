export interface ProcessedContent {
    id: string;
    originalContent: string;
    cleanContent: string;
    extractedText: string;
    metadata: ContentMetadata;
    processingDate: Date;
}

export interface ContentMetadata {
    wordCount: number;
    readingTime: number; // 预计阅读时间（分钟）
    keyPhrases: string[];
    language?: string;
    mainTopics?: string[];
    contentType: 'article' | 'news' | 'blog' | 'other';
}

export interface ProcessingOptions {
    removeImages?: boolean;
    extractLinks?: boolean;
    detectLanguage?: boolean;
    extractTopics?: boolean;
    maxLength?: number;
}

export interface ProcessingResult {
    success: boolean;
    content?: ProcessedContent;
    error?: string;
    processingTime?: number; // 处理时间（毫秒）
}