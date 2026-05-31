export const FREE_PREVIEW_SCAN_LIMIT = 5;

export function getRemainingFreePreviewScans(freeScansUsed: number) {
  return Math.max(FREE_PREVIEW_SCAN_LIMIT - freeScansUsed, 0);
}

export function canUseFreePreviewScan(freeScansUsed: number) {
  return getRemainingFreePreviewScans(freeScansUsed) > 0;
}
