export interface LibraryInfo {
    id: string;
    name: string;
    description: string;
    codeSnippets: number;
    sourceReputation: string;
    benchmarkScore: number;
    versions?: string[];
}

export interface Context7QueryResult {
    content: string;
    codeExamples?: string[];
    documentation?: string;
}

export interface IContext7Service {
    resolveLibraryId(libraryName: string, query: string): Promise<LibraryInfo[]>;
    queryDocs(libraryId: string, query: string, researchMode?: boolean): Promise<Context7QueryResult>;
}
