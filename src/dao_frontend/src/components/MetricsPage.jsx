import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { listMetadataRecords } from '../services/metadataIndex';

function isExpired(record) {
  const expiresAt = record?.policy?.expiresAt;
  if (!expiresAt) {
    return false;
  }
  return new Date(expiresAt).getTime() < Date.now();
}

function buildKpis(records) {
  const totalRecords = records.length;
  const revokedRecords = records.filter((record) => record.revoked).length;
  const expiredRecords = records.filter((record) => !record.revoked && isExpired(record)).length;
  const activeGrants = records.filter((record) => record.policy && !record.revoked && !isExpired(record)).length;

  const allEvents = records.flatMap((record) => record.auditTrail || []);
  const approvedDecrypts = allEvents.filter((event) => event.action === 'decrypt-approved').length;
  const deniedDecrypts = allEvents.filter((event) => event.action === 'decrypt-denied').length;

  const in24h = Date.now() + 24 * 60 * 60 * 1000;
  const expiringSoon = records.filter((record) => {
    if (!record.policy?.expiresAt || record.revoked) {
      return false;
    }
    const expiryTs = new Date(record.policy.expiresAt).getTime();
    return expiryTs >= Date.now() && expiryTs <= in24h;
  }).length;

  return {
    totalRecords,
    activeGrants,
    revokedRecords,
    expiredRecords,
    approvedDecrypts,
    deniedDecrypts,
    expiringSoon,
  };
}

function buildAccessTrend(records) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const buckets = [];
  const now = new Date();

  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - daysAgo);
    const key = date.toISOString().slice(0, 10);
    buckets.push({
      key,
      label: dayNames[date.getDay()],
      approved: 0,
      denied: 0,
      grants: 0,
      revokes: 0,
    });
  }

  const map = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  records.forEach((record) => {
    (record.auditTrail || []).forEach((event) => {
      const key = new Date(event.timestamp).toISOString().slice(0, 10);
      const bucket = map.get(key);
      if (!bucket) {
        return;
      }

      if (event.action === 'decrypt-approved') bucket.approved += 1;
      if (event.action === 'decrypt-denied') bucket.denied += 1;
      if (event.action === 'grant') bucket.grants += 1;
      if (event.action === 'revoke') bucket.revokes += 1;
    });
  });

  return buckets;
}

function buildNeuralTrend() {
  return [
    { t: '00:00', focus: 68, stress: 36, alpha: 54 },
    { t: '00:30', focus: 71, stress: 33, alpha: 57 },
    { t: '01:00', focus: 76, stress: 30, alpha: 61 },
    { t: '01:30', focus: 73, stress: 34, alpha: 58 },
    { t: '02:00', focus: 79, stress: 27, alpha: 64 },
    { t: '02:30', focus: 82, stress: 24, alpha: 66 },
  ];
}

const STATUS_COLORS = ['#22c55e', '#f43f5e', '#f59e0b'];

function KpiCard({ label, value, helper }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-black/40 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </article>
  );
}

export default function MetricsPage() {
  const records = useMemo(() => listMetadataRecords(), []);
  const kpis = useMemo(() => buildKpis(records), [records]);
  const accessTrend = useMemo(() => buildAccessTrend(records), [records]);
  const neuralTrend = useMemo(() => buildNeuralTrend(), []);

  const consentStatus = useMemo(
    () => [
      { name: 'Active', value: kpis.activeGrants },
      { name: 'Revoked', value: kpis.revokedRecords },
      { name: 'Expired', value: kpis.expiredRecords },
    ],
    [kpis.activeGrants, kpis.revokedRecords, kpis.expiredRecords]
  );

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-24 sm:px-6">
      <section className="mb-6 rounded-xl border border-slate-800 bg-slate-950/70 p-6">
        <h1 className="text-2xl font-semibold text-slate-100">Metrics and Charts</h1>
        <p className="mt-2 text-slate-300">
          Demo analytics for consent lifecycle, access outcomes, and neural telemetry snapshots.
        </p>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Encrypted Records" value={kpis.totalRecords} />
        <KpiCard label="Active Grants" value={kpis.activeGrants} helper={`${kpis.expiringSoon} expiring in 24h`} />
        <KpiCard label="Decrypt Approved" value={kpis.approvedDecrypts} />
        <KpiCard label="Decrypt Denied" value={kpis.deniedDecrypts} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Consent Status Distribution</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={consentStatus} dataKey="value" nameKey="name" outerRadius={100} label>
                  {consentStatus.map((entry, index) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Access Outcomes (7 Days)</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accessTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" name="Decrypt Approved" fill="#22c55e" />
                <Bar dataKey="denied" name="Decrypt Denied" fill="#f43f5e" />
                <Bar dataKey="grants" name="Grants" fill="#38bdf8" />
                <Bar dataKey="revokes" name="Revokes" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Neural Session Snapshot</h2>
        <p className="mt-1 text-sm text-slate-400">Simulated telemetry for demo storytelling.</p>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={neuralTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="t" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="focus" stroke="#22d3ee" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="stress" stroke="#fb7185" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="alpha" stroke="#a78bfa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}