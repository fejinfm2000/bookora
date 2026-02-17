export interface Book {
    id: string;
    title: string;
    author: string;
    genre: string;
    description: string;
    coverImage: string;
    pages: BookPage[];
    pageCount: number;
    viewCount: number;
    downloadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface BookPage {
    id: string;
    pageNumber: number;
    content: PageBlock[];
}

export interface PageBlock {
    id: string;
    type: 'paragraph' | 'heading' | 'image' | 'video';
    content: string;
}
