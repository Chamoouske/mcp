import { IContext7Service } from '../../domain/interfaces/IContext7Service.js';
import { ITool, ToolDefinition, ToolResult } from '../../domain/interfaces/ITool.js';

export default class QueryDocsTool implements ITool {
    constructor(private context7Service: IContext7Service) { }

    getDefinition(): ToolDefinition {
        return {
            name: 'context7_query_docs',
            description: 'Retrieves documentation and code examples from Context7 for a library',
            inputSchema: {
                type: 'object',
                properties: {
                    libraryId: {
                        type: 'string',
                        description: 'Context7 library ID (from resolve-library-id)'
                    },
                    query: {
                        type: 'string',
                        description: 'The question or task you need help with'
                    },
                    researchMode: {
                        type: 'boolean',
                        description: 'Enable deep research mode',
                        default: false
                    },
                },
                required: ['libraryId', 'query'],
            },
        };
    }

    async execute(args: any): Promise<ToolResult> {
        const result = await this.context7Service.queryDocs(
            args.libraryId,
            args.query,
            args.researchMode || false
        );
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
}
