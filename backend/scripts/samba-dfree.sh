# /opt/filesystem-sas/backend/scripts/samba-dfree.sh

# DEBUG LOGGING
echo "$(date) - Called with Arg1: $1" >> /tmp/samba-dfree.log
chmod 666 /tmp/samba-dfree.log 2>/dev/null

DB_FILE="/opt/filesystem-sas/backend/database.json"

TARGET_DIR="$1"
[ "$TARGET_DIR" = "." ] && TARGET_DIR="$PWD"

ABS_PATH=$(/usr/bin/realpath "$TARGET_DIR" 2>/dev/null || echo "$TARGET_DIR")
ABS_PATH="${ABS_PATH%/}"

LIMIT=""
if [ -f "$DB_FILE" ]; then
    LIMIT=$(/usr/bin/jq -r --arg path "$ABS_PATH" '.folders[] | select(.path as $p | $path | startswith($p)) | .limitMB' "$DB_FILE" 2>/dev/null | /usr/bin/sort -rn | /usr/bin/head -n 1)
fi

if [ -n "$LIMIT" ] && [ "$LIMIT" -eq "$LIMIT" ] 2>/dev/null && [ "$LIMIT" -gt 0 ] 2>/dev/null; then
    TOTAL_KB=$((LIMIT * 1024))
    USED_KB=$(/usr/bin/du -sk "$ABS_PATH" 2>/dev/null | /usr/bin/cut -f1)
    [ -z "$USED_KB" ] && USED_KB=0
    FREE_KB=$((TOTAL_KB - USED_KB))
    [ "$FREE_KB" -lt 0 ] && FREE_KB=0
    echo "$TOTAL_KB $FREE_KB"
    exit 0
fi

/usr/bin/df -k "$TARGET_DIR" 2>/dev/null | /usr/bin/awk 'END {print $2, $4}'
