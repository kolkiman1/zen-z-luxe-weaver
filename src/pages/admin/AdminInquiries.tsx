import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Eye, MessageCircle, Send, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLog } from '@/hooks/useActivityLog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const statusOptions = ['pending', 'in_progress', 'resolved', 'closed'];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  in_progress: 'bg-blue-500/20 text-blue-500',
  resolved: 'bg-green-500/20 text-green-500',
  closed: 'bg-muted text-muted-foreground',
};

const AdminInquiries = () => {
  const { logActivity } = useActivityLog();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const fetchInquiries = async () => {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInquiries(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    const inquiry = inquiries.find(i => i.id === inquiryId);
    const oldStatus = inquiry?.status;
    
    setIsUpdating(true);
    const { error } = await supabase
      .from('inquiries')
      .update({ status: newStatus })
      .eq('id', inquiryId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      await logActivity('inquiry_updated', 'inquiry', inquiryId, { 
        subject: inquiry?.subject,
        old_status: oldStatus, 
        new_status: newStatus 
      });
      toast.success('Status updated');
      fetchInquiries();
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    }
    setIsUpdating(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    
    setIsUpdating(true);
    const { error } = await supabase
      .from('inquiries')
      .update({ admin_notes: adminNotes })
      .eq('id', selectedInquiry.id);

    if (error) {
      toast.error('Failed to save notes');
    } else {
      await logActivity('inquiry_updated', 'inquiry', selectedInquiry.id, { 
        subject: selectedInquiry.subject,
        notes_updated: true 
      });
      toast.success('Notes saved');
      fetchInquiries();
      setSelectedInquiry({ ...selectedInquiry, admin_notes: adminNotes });
    }
    setIsUpdating(false);
  };

  const handleSendReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setIsSendingReply(true);
    try {
      const { error } = await supabase.functions.invoke('inquiry-reply', {
        body: {
          inquiryId: selectedInquiry.id,
          customerName: selectedInquiry.name,
          customerEmail: selectedInquiry.email,
          originalSubject: selectedInquiry.subject,
          replyMessage: replyMessage.trim(),
        },
      });

      if (error) throw error;

      await logActivity('inquiry_replied', 'inquiry', selectedInquiry.id, {
        subject: selectedInquiry.subject,
        customer_email: selectedInquiry.email,
      });

      // Auto-update status to in_progress if pending
      if (selectedInquiry.status === 'pending') {
        await handleStatusChange(selectedInquiry.id, 'in_progress');
      }

      toast.success('Reply sent successfully!');
      setReplyMessage('');
      setActiveTab('details');
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply: ' + (error.message || 'Unknown error'));
    }
    setIsSendingReply(false);
  };

  const openInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.admin_notes || '');
    setReplyMessage('');
    setActiveTab('details');
  };

  const filteredInquiries = inquiries.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Inquiries | Admin - Gen-zee.store</title>
      </Helmet>

      <AdminLayout title="Customer Inquiries">
        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Inquiries Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle size={64} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-2xl mb-2">No inquiries yet</h2>
              <p className="text-muted-foreground">Customer inquiries will appear here</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Subject</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map((inquiry, index) => (
                      <motion.tr
                        key={inquiry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-t border-border hover:bg-secondary/20"
                      >
                        <td className="p-4">
                          <p className="font-medium">{inquiry.name}</p>
                          <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                        </td>
                        <td className="p-4">{inquiry.subject}</td>
                        <td className="p-4 text-sm">
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Select
                            value={inquiry.status}
                            onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-32">
                              <Badge className={statusColors[inquiry.status]}>
                                {inquiry.status.replace('_', ' ')}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(status => (
                                <SelectItem key={status} value={status} className="capitalize">
                                  {status.replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openInquiry(inquiry)}
                            >
                              <Eye size={16} />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredInquiries.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No inquiries found</p>
              )}
            </div>
          )}
        </div>

        {/* Inquiry Details Dialog */}
        <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
            </DialogHeader>

            {selectedInquiry && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details & Notes</TabsTrigger>
                  <TabsTrigger value="reply" className="gap-2">
                    <Send size={14} />
                    Reply to Customer
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-4">
                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedInquiry.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">
                        {selectedInquiry.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p>{new Date(selectedInquiry.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge className={statusColors[selectedInquiry.status]}>
                        {selectedInquiry.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Subject & Message */}
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Subject</p>
                    <p className="font-medium">{selectedInquiry.subject}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Message</p>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedInquiry.message}</p>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <Label>Admin Notes (Internal)</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes about this inquiry..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
                      Close
                    </Button>
                    <Button onClick={handleSaveNotes} disabled={isUpdating} className="btn-primary">
                      Save Notes
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="reply" className="space-y-6 mt-4">
                  {/* Reply context */}
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Replying to:</p>
                    <p className="font-medium">{selectedInquiry.name} ({selectedInquiry.email})</p>
                    <p className="text-sm text-muted-foreground mt-2">Subject: {selectedInquiry.subject}</p>
                  </div>

                  {/* Original message reference */}
                  <div>
                    <Label className="text-muted-foreground">Original Message</Label>
                    <div className="p-3 bg-secondary/50 rounded-lg mt-1 max-h-32 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                    </div>
                  </div>

                  {/* Reply textarea */}
                  <div>
                    <Label>Your Reply</Label>
                    <Textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply to the customer..."
                      rows={6}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This reply will be sent from support@gen-zee.store
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setActiveTab('details')}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleSendReply} 
                      disabled={isSendingReply || !replyMessage.trim()} 
                      className="btn-primary gap-2"
                    >
                      {isSendingReply ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
};

export default AdminInquiries;
