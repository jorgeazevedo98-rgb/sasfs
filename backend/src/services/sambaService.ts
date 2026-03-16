import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';

const execPromise = util.promisify(exec);

export class SambaService {
    async createShare(shareName: string, path: string, username?: string): Promise<boolean> {
        try {
            console.log(`[SAMBA] Initializing share: ${shareName} at ${path} (User: ${username || 'guest'})`);
            await fs.mkdir(path, { recursive: true });
            await execPromise(`chmod 777 "${path}"`);
            
            const guestOk = username ? 'n' : 'y';
            
            // Create the share
            const cmd = `net conf addshare "${shareName}" "${path}" writeable=y guest_ok=${guestOk} "SAS dynamic share"`;
            console.log(`[SAMBA] Executing addshare: ${cmd}`);
            const { stdout, stderr } = await execPromise(cmd);
            
            // Note: dfree command is set [global]ly for the entire server in scripts/samba-dfree.sh
            
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
            return false;
        }
    }

    async deleteShare(shareName: string, path: string): Promise<boolean> {
        try {
            console.log(`[SAMBA] Deleting share: ${shareName}`);
            try {
                await execPromise(`net conf delshare "${shareName}"`);
            } catch (err) {
                console.warn(`[SAMBA] Share ${shareName} not found in config`);
            }
            try {
                await fs.rm(path, { recursive: true, force: true });
                console.log(`[SAMBA] Directory ${path} deleted successfully`);
            } catch (err: any) {
                console.error(`[SAMBA] Error deleting directory ${path}: ${err.message}`);
            }
            return true;
        } catch (error: any) {
            console.error('[SAMBA] Critical error during deletion:', error.message);
            return false;
        }
    }

    async getAuditLogs(): Promise<any[]> {
        return [];
    }
}

export default new SambaService();
