import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get('id');

    if (!moduleId) {
        return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    try {
        const moduleData = await prisma.module.findUnique({
            where: { id: parseInt(moduleId) }
        });

        if (!moduleData) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        // Prepare JSON content
        const jsonContent = JSON.stringify(moduleData, null, 2);

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const archive = archiver('zip', {
                    zlib: { level: 9 }
                });

                archive.on('error', (err) => {
                    controller.error(err);
                });

                archive.on('data', (chunk) => {
                    controller.enqueue(chunk);
                });

                archive.on('end', () => {
                    controller.close();
                });

                // Append module.json
                archive.append(jsonContent, { name: `module-${moduleData.slug || moduleId}.json` });

                await archive.finalize();
            }
        });

        const headers = new Headers();
        headers.set('Content-Type', 'application/zip');
        headers.set('Content-Disposition', `attachment; filename="${moduleData.slug || 'module'}-${moduleId}.zip"`);

        return new NextResponse(stream, { headers });

    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
