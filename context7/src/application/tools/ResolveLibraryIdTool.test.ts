/// <reference types="vitest/globals" />
import ResolveLibraryIdTool from './ResolveLibraryIdTool';

describe('ResolveLibraryIdTool', () => {
    it('should have correct tool definition', () => {
        const tool = new ResolveLibraryIdTool({} as any);
        const def = tool.getDefinition();
        expect(def.name).toBe('context7_resolve_library_id');
        expect(def.inputSchema.required).toContain('libraryName');
        expect(def.inputSchema.required).toContain('query');
    });

    it('should call resolveLibraryId and return formatted result', async () => {
        const mockService = {
            resolveLibraryId: async (libraryName: string, query: string) => [
                {
                    id: '/org/project',
                    name: 'TestLib',
                    description: 'Test library',
                    codeSnippets: 5,
                    sourceReputation: 'High',
                    benchmarkScore: 95,
                },
            ],
            queryDocs: async () => ({}),
        };

        const tool = new ResolveLibraryIdTool(mockService as any);
        const result = await tool.execute({ libraryName: 'TestLib', query: 'test' });
        expect(result.content[0].text).toContain('/org/project');
    });
});
