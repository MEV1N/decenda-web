import path from 'path';
import fs from 'fs';
import { prisma } from '../server.js';

/**
 * Encapsulates the logic to delete a live challenge and its associated files.
 * @param id The ID of the live challenge to delete.
 */
export async function deleteLiveChallenge(id: string) {
    try {
        const challenge = await (prisma as any).liveChallenge.findUnique({ where: { id } });

        if (challenge) {
            // Delete associated file
            if (challenge.file_url) {
                const fileName = path.basename(challenge.file_url);
                const filePath = path.join(process.cwd(), 'server', 'uploads', fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            // Delete associated thumbnail
            if (challenge.thumbnail_url) {
                const fileName = path.basename(challenge.thumbnail_url);
                const filePath = path.join(process.cwd(), 'server', 'uploads', fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            // Delete from database
            await (prisma as any).liveChallenge.delete({
                where: { id }
            });

            console.log(`[Auto-Cleanup] Successfully deleted expired jackpot challenge: ${id}`);
        }
    } catch (error) {
        console.error(`[Auto-Cleanup] Error deleting challenge ${id}:`, error);
    }
}
