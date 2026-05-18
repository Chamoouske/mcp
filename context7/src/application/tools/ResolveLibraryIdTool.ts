import { IContext7Service } from '../../domain/interfaces/IContext7Service.js';
import { ITool, ToolDefinition, ToolResult } from '../../domain/interfaces/ITool.js';

export default class ResolveLibraryIdTool implements ITool {
    constructor(private context7Service: IContext7Service) { }

    getDefinition(): ToolDefinition {
        return {
            name: 'context7_resolve_library_id',
            description: 'Resolves a package/product name to a Context7-compatible library ID',
            inputSchema: {
                type: 'object',
                properties: {
                    libraryName: {
                        type: 'string',
                        description: 'Library name to search for (e.g., "Next.js", "Express")'
                    },
                    query: {
                        type: 'string',
                        description: 'Additional query to rank results'
                    },
                },
                required: ['libraryName', 'query'],
            },
        };
    }

    async execute(args: any): Promise<ToolResult> {
        const libraries = await this.context7Service.resolveLibraryId(args.libraryName, args.query);
        return {
            content: [{ type: 'text', text: JSON.stringify(libraries, null, 2) }],
        };
    }
}
