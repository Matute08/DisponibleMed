import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card } from '../components/Primitives';

export function Logs() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { api.get('/api/logs').then((r) => setLogs(r.data)); }, []);
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-med-900">Historial</h1>
      {logs.map((log) => <Card key={log.id}><p className="font-semibold">{log.decision}</p><p className="text-sm text-slate-600">{log.received_at} - {log.from_phone}</p><p className="text-sm">{log.message_sent}</p></Card>)}
    </div>
  );
}
