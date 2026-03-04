import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';

const execPromise = util.promisify(exec);

export class SambaService {
    /**
     * Creates a new Samba share
     * @param shareName Name of the share
     * @param path Local path to share
     */
    async createShare(shareName: string, path: string, username?: string): Promise<boolean> {
        try {
            console.log(`[SAMBA] Initializing share: ${shareName} at ${path} (User: ${username || 'guest'})`);

            // 1. Ensure directory exists
            await fs.mkdir(path, { recursive: true });

            // 2. Set permissions (UserService will refine this if a username is provided)
            await execPromise(`chmod 777 "${path}"`);

            // 3. Syntax: net conf addshare <name> <path> writeable=y guest_ok=n "comment"
            // We dynamicall add guest_ok based on username presence
            const guestOk = username ? 'n' : 'y';
            const validUsers = username ? ` "valid users"="${username}"` : '';

            const cmd = `net conf addshare "${shareName}" "${path}" writeable=y guest_ok=${guestOk} "SAS dynamic share"`;
            console.log(`[SAMBA] Executing addshare: ${cmd}`);

            const { stdout, stderr } = await execPromise(cmd);

            // 4. If we have a specific user, set the valid users restriction
            if (username) {
                const restrictCmd = `net conf setparm "${shareName}" "valid users" "${username}"`;
                console.log(`[SAMBA] Executing setparm: ${restrictCmd}`);
                await execPromise(restrictCmd);
            }

            if (stdout) console.log(`[SAMBA] stdout: ${stdout}`);
            if (stderr && !stderr.includes('already exists')) {
                console.error(`[SAMBA] error: ${stderr}`);
                return false;
            }

            return true;
        } catch (error: any) {
            console.error('[SAMBA] Critical error:', error.message);
            if (error.stderr) console.error('[SAMBA] stderr:', error.stderr);
            return false;
        }
    }

    /**
     * Removes a Samba share
     */
    async deleteShare(shareName: string, path: string): Promise<boolean> {
        try {
            console.log(`[SAMBA] Deleting share: ${shareName}`);

            // 1. Delete from Samba
            try {
                await execPromise(`net conf delshare "${shareName}"`);
            } catch (err) {
                console.warn(`[SAMBA] Share ${shareName} not found in config`);
            }

            // 2. Delete from disk
            try {
                await fs.rm(path, { recursive: true, force: true });
                console.log(`[SAMBA] Directory removed: ${path}`);
            } catch (err) {
                console.error(`[SAMBA] Failed to remove directory: ${path}`);
            }

            return true;
        } catch (error) {
            console.error('[SAMBA] Delete error:', error);
            return false;
        }
    }
}

export default new SambaService();
