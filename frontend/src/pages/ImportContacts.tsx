import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Card, TextArea } from '../components/Primitives';
import { api } from '../lib/api';

export function ImportContacts() {
  const [raw, setRaw] = useState('Maria Doblas, 02954 123456\nJuan Perez, +54 9 2954 654321');
  const [preview, setPreview] = useState<any[]>([]);
  const runPreview = async () => {
    const contacts = raw.split('\n').map((line) => {
      const [name, phone] = line.split(',');
      return { name: name?.trim(), phone: phone?.trim() };
    }).filter((c) => c.name && c.phone);
    const { data } = await api.post('/api/google/import-preview', { contacts });
    setPreview(data.contacts);
  };
  const confirmImport = async () => {
    await api.post('/api/google/import-confirm', { contacts: preview });
    toast.success('Contactos importados');
  };
  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-xl font-bold text-med-900">Importar contactos</h1>
        <p className="mt-1 text-sm text-slate-600">Revisa una lista de contactos antes de incorporarlos a la agenda.</p>
        <TextArea className="mt-4" value={raw} onChange={(e) => setRaw(e.target.value)} />
        <div className="mt-3 flex gap-2"><Button onClick={runPreview}>Previsualizar</Button><Button onClick={confirmImport} disabled={!preview.length}>Confirmar</Button></div>
      </Card>
      {preview.map((c) => <Card key={c.phone}><b>{c.name}</b><p className="text-sm text-slate-600">{c.phone} - {c.auto_reply_enabled ? 'habilitado' : 'sin coincidencia'}</p></Card>)}
    </div>
  );
}
