import axios, { AxiosInstance } from 'axios';
import { IContext7Service, LibraryInfo, Context7QueryResult } from '../../domain/interfaces/IContext7Service.js';

export class Context7Service implements IContext7Service {
    private client: AxiosInstance;
    private apiKey: string;
    private baseURL: string = 'https://context7.com/api';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
        });
    }

    async resolveLibraryId(libraryName: string, query: string): Promise<LibraryInfo[]> {
        try {
            const response = await this.client.post('/resolve-library-id',
                { libraryName, query },
                { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
            );
            return response.data.libraries || [];
        } catch (error: any) {
            throw new Error(`Failed to resolve library ID: ${error.message}`);
        }
    }

    async queryDocs(libraryId: string, query: string, researchMode: boolean = false): Promise<Context7QueryResult> {
        try {
            const response = await this.client.post('/query-docs',
                { libraryId, query, researchMode },
                { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to query docs: ${error.message}`);
        }
    }
}
