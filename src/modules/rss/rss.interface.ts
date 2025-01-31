export interface RssSource {
    id: string;
    url: string;
    name: string;
    description?: string;
    updateInterval: number; // 更新间隔（分钟）
    lastUpdate?: Date;
    isActive: boolean;
}

export interface RssItem {
    id: string;
    title: string;
    content: string;
    link: string;
    pubDate: Date;
    author?: string;
    categories?: string[];
    sourceId: string;
    processed: boolean;
    summary?: string;
    audioUrl?: string;
}

export interface RssProcessingResult {
    success: boolean;
    message?: string;
    itemsProcessed: number;
    errors?: string[];
}