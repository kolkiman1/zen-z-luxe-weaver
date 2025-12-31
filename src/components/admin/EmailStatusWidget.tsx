import { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { format } from 'date-fns';

interface EmailLog {
  id: string;
  order_id: string | null;
  order_number: string | null;
  email_type: string;
  recipient_email: string;
  status: string;
  provider_response: any;
  error_message: string | null;
  created_at: string;
}

interface EmailStatusWidgetProps {
  orderId?: string;
  limit?: number;
}

const EmailStatusWidget = ({ orderId, limit = 10 }: EmailStatusWidgetProps) => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data, error } = await query;

    if (!error && data) {
      setLogs(data as EmailLog[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [orderId]);

  const toggleExpand = (logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Sent</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Failed</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pending</Badge>;
    }
  };

  const getEmailTypeLabel = (type: string) => {
    switch (type) {
      case 'order_confirmation':
        return 'Order Confirmation';
      case 'order_cancellation':
        return 'Order Cancellation';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Email Status</h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Email Status</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No email logs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Collapsible
              key={log.id}
              open={expandedLogs.has(log.id)}
              onOpenChange={() => toggleExpand(log.id)}
            >
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div className="text-left">
                        <p className="font-medium text-sm">{getEmailTypeLabel(log.email_type)}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.order_number || log.order_id?.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(log.status)}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, HH:mm')}
                      </span>
                      {expandedLogs.has(log.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-3 border-t border-border bg-secondary/20 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Recipient:</span>
                        <p className="font-mono text-xs mt-0.5">{log.recipient_email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sent at:</span>
                        <p className="text-xs mt-0.5">
                          {format(new Date(log.created_at), 'PPpp')}
                        </p>
                      </div>
                    </div>
                    
                    {log.error_message && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-2">
                        <p className="text-xs font-medium text-red-500 mb-1">Error Message:</p>
                        <p className="text-xs text-red-400 font-mono break-all">{log.error_message}</p>
                      </div>
                    )}

                    {log.provider_response && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Provider Response:</p>
                        <pre className="bg-secondary/50 rounded-lg p-2 text-xs overflow-x-auto">
                          {JSON.stringify(log.provider_response, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailStatusWidget;