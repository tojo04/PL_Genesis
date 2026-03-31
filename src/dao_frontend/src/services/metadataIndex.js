const INDEX_KEY = 'cerebrum.metadata.index.v1';
let memoryIndex = [];

function loadIndex() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(INDEX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  return memoryIndex;
}

function saveIndex(items) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(items));
    return;
  }

  memoryIndex = items;
}

export function listMetadataRecords() {
  return loadIndex();
}

export function getMetadataRecord(recordCid) {
  return loadIndex().find((item) => item.recordCid === recordCid) || null;
}

export function upsertMetadataRecord(record) {
  const records = loadIndex();
  const existingIndex = records.findIndex((item) => item.recordCid === record.recordCid);
  const merged = {
    createdAt: new Date().toISOString(),
    auditTrail: [],
    ...record,
  };

  if (existingIndex >= 0) {
    records[existingIndex] = {
      ...records[existingIndex],
      ...merged,
      auditTrail: records[existingIndex].auditTrail || [],
    };
  } else {
    records.unshift(merged);
  }

  saveIndex(records);
  return getMetadataRecord(record.recordCid);
}

export function appendAuditEvent(recordCid, event) {
  const records = loadIndex();
  const index = records.findIndex((item) => item.recordCid === recordCid);
  if (index < 0) {
    return null;
  }

  const nextEvent = {
    timestamp: new Date().toISOString(),
    ...event,
  };

  records[index] = {
    ...records[index],
    auditTrail: [...(records[index].auditTrail || []), nextEvent],
  };

  saveIndex(records);
  return nextEvent;
}

export function markRecordRevoked(recordCid, reason = 'manual-revoke') {
  const records = loadIndex();
  const index = records.findIndex((item) => item.recordCid === recordCid);
  if (index < 0) {
    return null;
  }

  records[index] = {
    ...records[index],
    revoked: true,
    revokedAt: new Date().toISOString(),
    revokeReason: reason,
  };

  saveIndex(records);
  appendAuditEvent(recordCid, { action: 'revoke', reason });
  return records[index];
}
