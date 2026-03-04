import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export class StorageService {
    /**
     * Sets a storage quota for a specific directory/user
     * @param path Path to the folder
     * @param limit Limit in bytes
     */
    async setQuota(path: string, limitInMB: number): Promise<boolean> {
        try {
            // Attempt generic setquota first, but don't crash if it fails
            // Many modern setups use XFS or ext4 project quotas
            const command = `setquota -u root ${limitInMB}M ${limitInMB}M 0 0 /`;
            // NOTE: On many NAS systems, we'd need to target the specific mount point.
            // For now, we keep it simple but non-blocking.
            const { stdout, stderr } = await execPromise(command);

            if (stderr) {
                console.error(`Quota error: ${stderr}`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error setting quota:', error);
            return false;
        }
    }

    /**
     * Gets usage information for a path
     * @param path Local path
     */
    async getUsage(path: string): Promise<{ used: number; total: number }> {
        try {
            const { stdout } = await execPromise(`df -B1 ${path} | tail -1 | awk '{print $3 " " $2}'`);
            const [used, total] = stdout.trim().split(' ').map(Number);

            return { used, total };
        } catch (error) {
            console.error('Error getting storage usage:', error);
            return { used: 0, total: 0 };
        }
    }

    /**
     * Gets actual directory size in MB
     */
    async getDirectorySize(path: string): Promise<number> {
        try {
            // du -sm returns size in MB
            const { stdout } = await execPromise(`du -sm "${path}" | awk '{print $1}'`);
            return parseInt(stdout.trim()) || 0;
        } catch (error) {
            // If folder doesn't exist or other error, return 0
            return 0;
        }
    }

    /**
     * Gets total partition capacity in MB
     */
    async getPartitionCapacity(path: string): Promise<number> {
        try {
            // df -m returns size in MB
            const { stdout } = await execPromise(`df -m "${path}" | tail -1 | awk '{print $2}'`);
            return parseInt(stdout.trim()) || 0;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Gets both used and total capacity in MB for a partition
     */
    async getPartitionUsage(path: string): Promise<{ usedMB: number; totalMB: number }> {
        try {
            // df -m: used is col 3, total is col 2
            const { stdout } = await execPromise(`df -m "${path}" | tail -1 | awk '{print $3 " " $2}'`);
            const [usedMB, totalMB] = stdout.trim().split(/\s+/).map(Number);
            return { usedMB: usedMB || 0, totalMB: totalMB || 0 };
        } catch (error) {
            console.error('Error getting partition usage:', error);
            return { usedMB: 0, totalMB: 0 };
        }
    }
}

export default new StorageService();
