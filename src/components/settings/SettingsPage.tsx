import { useState } from 'react';
import { Link2, Link2Off, Database, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  getScriptUrl,
  setScriptUrl,
  clearScriptUrl,
  isGoogleSheetsConnected,
  fetchAllItems,
  syncToSheet,
} from '@/lib/sheets';
import { useInventoryContext } from '@/context/InventoryContext';

export function SettingsPage() {
  const { items, dispatch } = useInventoryContext();
  const [url, setUrl] = useState(getScriptUrl() || '');
  const [connected, setConnected] = useState(isGoogleSheetsConnected());
  const [status, setStatus] = useState<string>('');
  const [syncing, setSyncing] = useState(false);

  const handleConnect = async () => {
    if (!url.trim()) return;
    setStatus('Connecting...');
    try {
      setScriptUrl(url.trim());
      const items = await fetchAllItems();
      if (items.length > 0) {
        dispatch({ type: 'SET_ITEMS', items });
      }
      setConnected(true);
      setStatus(`Connected! Loaded ${items.length} items from Google Sheets.`);
    } catch (err) {
      clearScriptUrl();
      setConnected(false);
      setStatus(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDisconnect = () => {
    clearScriptUrl();
    setConnected(false);
    setUrl('');
    setStatus('Disconnected from Google Sheets.');
  };

  const handleSync = async () => {
    if (!isGoogleSheetsConnected()) return;
    setSyncing(true);
    setStatus('Syncing...');
    try {
      const rawItems = items.map(({ status: _s, needToBuy: _n, ...rest }) => rest);
      await syncToSheet(rawItems);
      setStatus('Synced all items to Google Sheets.');
    } catch (err) {
      setStatus(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleRefresh = async () => {
    if (!isGoogleSheetsConnected()) return;
    setSyncing(true);
    setStatus('Refreshing...');
    try {
      const freshItems = await fetchAllItems();
      dispatch({ type: 'SET_ITEMS', items: freshItems });
      setStatus(`Refreshed! Loaded ${freshItems.length} items.`);
    } catch (err) {
      setStatus(`Refresh failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all data to defaults? This will replace your current inventory.')) {
      dispatch({ type: 'RESET_DATA' });
      setStatus('Data reset to defaults.');
    }
  };

  return (
    <div className="px-4 py-5 space-y-5">
      <h2 className="text-lg font-bold text-foreground">Settings</h2>

      {/* Google Sheets Connection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            Google Sheets Database
            {connected && <Badge variant="success" className="text-[10px]">Connected</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Connect your Google Sheet to use as a live database. Follow the setup instructions in the README.
          </p>
          <Input
            placeholder="Google Apps Script Web App URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={connected}
          />
          {status && (
            <p className={`text-xs px-2 py-1 rounded ${status.includes('fail') || status.includes('error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {status}
            </p>
          )}
          <div className="flex gap-2">
            {!connected ? (
              <Button size="sm" className="gap-1" onClick={handleConnect} disabled={!url.trim()}>
                <Link2 className="w-3.5 h-3.5" /> Connect
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" className="gap-1" onClick={handleRefresh} disabled={syncing}>
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} /> Refresh
                </Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={handleSync} disabled={syncing}>
                  <Database className="w-3.5 h-3.5" /> Push to Sheet
                </Button>
                <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={handleDisconnect}>
                  <Link2Off className="w-3.5 h-3.5" /> Disconnect
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            All data is stored locally in your browser. Connect Google Sheets for cloud sync.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={handleReset}>
              <Trash2 className="w-3.5 h-3.5" /> Reset to Defaults
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Items: {items.length} · Storage: ~{Math.round(JSON.stringify(items).length / 1024)}KB
          </p>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Google Sheets Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>Open your Google Sheet</li>
            <li>Go to <strong>Extensions &rarr; Apps Script</strong></li>
            <li>Paste the script from <code>google-apps-script.js</code></li>
            <li>Click <strong>Deploy &rarr; New deployment</strong></li>
            <li>Select type: <strong>Web app</strong></li>
            <li>Set "Execute as": <strong>Me</strong></li>
            <li>Set "Who has access": <strong>Anyone</strong></li>
            <li>Click Deploy and copy the URL</li>
            <li>Paste the URL above and click Connect</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
