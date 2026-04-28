declare module '@strapi/strapi' {
  export interface Strapi {
    plugin(name: 'ai-content-generator'): {
      service(name: 'qwenService'): {
        generateContent(params: {
          imageUrl?: string;
          description: string;
          brandTone?: string;
        }): Promise<{
          title: string;
          excerpt: string;
          content: string;
          readingTime: number;
        }>;
        testConnection(): Promise<boolean>;
      };
      controller(name: string, controller: any): void;
      routes(routes: any): void;
    };
  }
}

export {};
