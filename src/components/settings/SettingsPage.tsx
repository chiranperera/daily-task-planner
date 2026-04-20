import { useState } from 'react';
import { Link2, Link2Off, Database, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  getScriptUrl,
  setScriptUrl,
  clearScriptUrl,
  isGoogleSheetsConnected,
  fetchAllItems,
} from '@/lib/sheets';
import { useInventoryContext } from '@/context/InventoryContext';

export function SettingsPage() {
  const { items, dispatch } = useInventoryContext();
  const [url, setUrl] = useState(getScriptUrl() || '');
  const [connected, setConnected] = useState(isGoogleSheetsConnected());
  const [status, setStatus] = useState<string>('');
  const [statusKind, setStatusKind] = useState<'ok' | 'err' | null>(null);
  const [syncing, setSyncing] = useState(false);

  const handleConnect = async () => {
    if (!url.trim()) return;
    setStatus('Connecting...');
    setStatusKind(null);
    try {
      setScriptUrl(url.trim());
      const fetched = await fetchAllItems();
      if (fetched.length > 0) {
        dispatch({ type: 'SET_ITEMS', items: fetched });
      }
      setConnected(true);
      setStatus(`Connected — loaded ${fetched.length} items.`);
      setStatusKind('ok');
    } catch (err) {
      clearScriptUrl();
      setConnected(false);
      setStatus(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatusKind('err');
    }
  };

  const handleDisconnect = () => {
    clearScriptUrl();
    setConnected(false);
    setUrl('');
    setStatus('Disconnected from Google Sheets.');
    setStatusKind('ok');
  };

  const handleRefresh = async () => {
    if (!isGoogleSheetsConnected()) return;
    setSyncing(true);
    setStatus('Refreshing...');
    setStatusKind(null);
    try {
      const freshItems = await fetchAllItems();
      dispatch({ type: 'SET_ITEMS', items: freshItems });
      setStatus(`Refreshed — ${freshItems.length} items.`);
      setStatusKind('ok');
    } catch (err) {
      setStatus(`Refresh failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatusKind('err');
    } finally {
      setSyncing(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all data to defaults? This will replace your current inventory.')) {
      dispatch({ type: 'RESET_DATA' });
      setStatus('Data reset to defaults.');
      setStatusKind('ok');
    }
  };

  return (
    <div className="px-5 py-6 space-y-8">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
          Preferences
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mt-1">
          Settings
        </h2>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-semibold text-neutral-900">Google Sheets</h3>
          </div>
          {connected && <Badge variant="outline">Connected</Badge>}
        </div>
        <p className="text-xs text-neutral-500">
          Connect a Google Sheet as a live database. See the README for setup.
        </p>
        <Input
          placeholder="Google Apps Script Web App URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={connected}
        />
        {status && (
          <p
            className={`text-xs px-2.5 py-1.5 rounded border ${
              statusKind === 'err'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-neutral-50 text-neutral-700 border-neutral-200'
            }`}
          >
            {status}
          </p>
        )}
        <div className="flex gap-2">
          {!connected ? (
            <Button size="sm" className="gap-1.5" onClick={handleConnect} disabled={!url.trim()}>
              <Link2 className="w-3.5 h-3.5" /> Connect
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={handleRefresh}
                disabled={syncing}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={handleDisconnect}>
                <Link2Off className="w-3.5 h-3.5" /> Disconnect
              </Button>
            </>
          )}
        </div>
      </section>

      <div className="h-px bg-neutral-200" />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-neutral-900">Data</h3>
        <p className="text-xs text-neutral-500">
          All data is stored locally in your browser. Connect Google Sheets for cloud sync.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleReset}>
            <Trash2 className="w-3.5 h-3.5" /> Reset to defaults
          </Button>
        </div>
        <p className="text-[11px] text-neutral-400 tabular-nums">
          {items.length} items · ~{Math.round(JSON.stringify(items).length / 1024)} KB
        </p>
      </section>

      <div className="h-px bg-neutral-200" />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-neutral-900">Sheets setup</h3>
        <ol className="text-xs text-neutral-600 space-y-1.5 list-decimal list-inside">
          <li>Open your Google Sheet</li>
          <li>Go to <strong className="text-neutral-900">Extensions → Apps Script</strong></li>
          <li>Paste the script from <code className="bg-neutral-100 px-1 rounded">google-apps-script.js</code></li>
          <li>Click <strong className="text-neutral-900">Deploy → New deployment</strong></li>
          <li>Type: <strong className="text-neutral-900">Web app</strong></li>
          <li>Execute as: <strong className="text-neutral-900">Me</strong></li>
          <li>Access: <strong className="text-neutral-900">Anyone</strong></li>
          <li>Deploy and copy the URL</li>
          <li>Paste above and click Connect</li>
        </ol>
      </section>
    </div>
  );
}
