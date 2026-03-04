import { exec } from 'child_process';
import util from 'util';
import crypto from 'crypto';

const execPromise = util.promisify(exec);

export class UserService {
    /**
     * Generates a random alphanumeric password
     */
    generatePassword(length: number = 12): string {
        return crypto.randomBytes(length).toString('base64')
            .replace(/[/+=]/g, '')
            .substring(0, length);
    }

    /**
     * Creates a Linux system user and Samba user
     * @param username The name of the user to create
     * @param password The password for the user
     * @param homeDir The directory this user is restricted to
     */
    async createSystemUser(username: string, password: string, homeDir: string): Promise<boolean> {
        try {
            console.log(`[USER-SERVICE] Creating system user: ${username} for ${homeDir}`);

            // 1. Ensure the directory exists (it might be created here or in sambaService)
            await execPromise(`mkdir -p "${homeDir}"`);

            // 2. Create Linux user if not exists
            const { stdout: userExists } = await execPromise(`id "${username}"`).catch(() => ({ stdout: '' }));

            if (!userExists) {
                // -M: don't create home dir
                // -d: set home directory
                // -s: set shell to nologin
                await execPromise(`useradd -M -d "${homeDir}" -s /usr/sbin/nologin "${username}"`);
                // Add to sambashare group
                await execPromise(`usermod -aG sambashare "${username}"`);
            }

            // 3. Set Linux password
            await execPromise(`echo "${username}:${password}" | chpasswd`);

            // 4. Create/Update Samba user
            // Use printf for more reliable piping
            await execPromise(`printf "${password}\n${password}\n" | smbpasswd -a -s "${username}"`);

            // 5. Set folder ownership
            await execPromise(`chown "${username}":sambashare "${homeDir}"`);
            await execPromise(`chmod 770 "${homeDir}"`);

            return true;
        } catch (error: any) {
            console.error('[USER-SERVICE] Error creating user:', error.message);
            if (error.stderr) console.error('[USER-SERVICE] stderr:', error.stderr);
            return false;
        }
    }

    /**
     * Deletes a system and Samba user
     */
    async deleteSystemUser(username: string): Promise<void> {
        try {
            console.log(`[USER-SERVICE] Deleting user: ${username}`);
            // 1. Kill all processes by this user (disconnects FTP/Samba)
            await execPromise(`pkill -u "${username}"`).catch(() => { });

            // 2. Remove from Samba
            await execPromise(`smbpasswd -x "${username}"`).catch(() => { });

            // 3. Remove from Linux
            await execPromise(`userdel -f "${username}"`).catch(() => { });
        } catch (error) {
            console.error('[USER-SERVICE] Error deleting user:', error);
        }
    }
}

export default new UserService();
