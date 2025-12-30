import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  Edit2, 
  ChevronRight,
  Loader2,
  Save,
  Plus,
  Trash2,
  CreditCard,
  Home,
  Building,
  Star,
  Camera,
  Upload
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';

import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string | null;
  is_default: boolean;
}

interface PaymentMethod {
  id: string;
  card_last_four: string;
  card_brand: string;
  card_holder_name: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

const UserDashboard = () => {
  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  const { items: wishlistItems } = useWishlist();
  
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
  });

  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    is_default: false,
  });

  const [cardForm, setCardForm] = useState({
    card_holder_name: '',
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    is_default: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        postal_code: profile.postal_code || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const [ordersRes, addressesRes, cardsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, status, total_amount, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('customer_addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false }),
        supabase
          .from('saved_payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false }),
      ]);

      if (ordersRes.data) setOrders(ordersRes.data);
      if (addressesRes.data) setAddresses(addressesRes.data);
      if (cardsRes.data) setPaymentMethods(cardsRes.data);
      setLoading(false);
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(formData);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({ avatar_url: publicUrl });

      if (updateError) throw updateError;

      toast.success('Profile photo updated!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    setSaving(true);

    try {
      if (addressForm.is_default) {
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      if (editingAddress) {
        const { error } = await supabase
          .from('customer_addresses')
          .update({
            label: addressForm.label,
            full_name: addressForm.full_name,
            phone: addressForm.phone || null,
            address_line1: addressForm.address_line1,
            address_line2: addressForm.address_line2 || null,
            city: addressForm.city,
            postal_code: addressForm.postal_code || null,
            is_default: addressForm.is_default,
          })
          .eq('id', editingAddress.id);

        if (error) throw error;
        toast.success('Address updated successfully');
      } else {
        const { error } = await supabase
          .from('customer_addresses')
          .insert({
            user_id: user.id,
            label: addressForm.label,
            full_name: addressForm.full_name,
            phone: addressForm.phone || null,
            address_line1: addressForm.address_line1,
            address_line2: addressForm.address_line2 || null,
            city: addressForm.city,
            postal_code: addressForm.postal_code || null,
            is_default: addressForm.is_default || addresses.length === 0,
          });

        if (error) throw error;
        toast.success('Address added successfully');
      }

      const { data } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (data) setAddresses(data);
      setAddressDialogOpen(false);
      resetAddressForm();
    } catch (error) {
      toast.error('Failed to save address');
    }
    setSaving(false);
  };

  const handleDeleteAddress = async (id: string) => {
    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete address');
    } else {
      setAddresses(addresses.filter((a) => a.id !== id));
      toast.success('Address deleted');
    }
  };

  const handleSaveCard = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const cardNumber = cardForm.card_number.replace(/\s/g, '');
      const lastFour = cardNumber.slice(-4);
      const brand = getCardBrand(cardNumber);

      if (cardForm.is_default) {
        await supabase
          .from('saved_payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { error } = await supabase
        .from('saved_payment_methods')
        .insert({
          user_id: user.id,
          card_last_four: lastFour,
          card_brand: brand,
          card_holder_name: cardForm.card_holder_name,
          expiry_month: parseInt(cardForm.expiry_month),
          expiry_year: parseInt(cardForm.expiry_year),
          is_default: cardForm.is_default || paymentMethods.length === 0,
        });

      if (error) throw error;

      const { data } = await supabase
        .from('saved_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (data) setPaymentMethods(data);
      setCardDialogOpen(false);
      setCardForm({
        card_holder_name: '',
        card_number: '',
        expiry_month: '',
        expiry_year: '',
        is_default: false,
      });
      toast.success('Card saved successfully');
    } catch (error) {
      toast.error('Failed to save card');
    }
    setSaving(false);
  };

  const handleDeleteCard = async (id: string) => {
    const { error } = await supabase
      .from('saved_payment_methods')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete card');
    } else {
      setPaymentMethods(paymentMethods.filter((c) => c.id !== id));
      toast.success('Card removed');
    }
  };

  const getCardBrand = (number: string): string => {
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^6(?:011|5)/.test(number)) return 'Discover';
    return 'Card';
  };

  const resetAddressForm = () => {
    setEditingAddress(null);
    setAddressForm({
      label: 'Home',
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      postal_code: '',
      is_default: false,
    });
  };

  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone || '',
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      postal_code: address.postal_code || '',
      is_default: address.is_default,
    });
    setAddressDialogOpen(true);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    processing: 'bg-blue-500/20 text-blue-500',
    shipped: 'bg-purple-500/20 text-purple-500',
    delivered: 'bg-green-500/20 text-green-500',
    cancelled: 'bg-red-500/20 text-red-500',
  };

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </main>
        <Footer />
      </>
    );
  }

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

  return (
    <>
      <SEOHead
        title="My Account"
        description="Manage your account, view orders, and update your profile."
        noIndex={true}
      />

      <Header />

      <main className="pt-24 pb-16 min-h-screen">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl mb-2">My Account</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || 'Valued Customer'}!
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-display">{orders.length}</p>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <span className="text-green-500 font-display text-lg">৳</span>
                    </div>
                    <div>
                      <p className="text-2xl font-display">{formatPrice(totalSpent)}</p>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-display">{wishlistItems.length}</p>
                      <p className="text-sm text-muted-foreground">Wishlist Items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Addresses</span>
              </TabsTrigger>
              <TabsTrigger value="cards" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profile Information
                    </CardTitle>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={saving}>
                          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                          Save
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8 pb-6 border-b border-border">
                      <div className="relative group">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                            {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <label
                          htmlFor="avatar-upload"
                          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          {uploadingAvatar ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          ) : (
                            <Camera className="w-6 h-6 text-white" />
                          )}
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Click to change photo</p>
                    </div>

                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+880 1XXX-XXXXXX"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postal_code">Postal Code</Label>
                          <Input
                            id="postal_code"
                            value={formData.postal_code}
                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                          <User className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{profile?.full_name || 'Not set'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{profile?.phone || 'Not set'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="font-medium">
                              {profile?.address 
                                ? `${profile.address}${profile.city ? `, ${profile.city}` : ''}${profile.postal_code ? ` - ${profile.postal_code}` : ''}`
                                : 'Not set'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Delivery Addresses
                    </CardTitle>
                    <Dialog open={addressDialogOpen} onOpenChange={(open) => {
                      setAddressDialogOpen(open);
                      if (!open) resetAddressForm();
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Label</Label>
                              <Select
                                value={addressForm.label}
                                onValueChange={(value) => setAddressForm({ ...addressForm, label: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Home">Home</SelectItem>
                                  <SelectItem value="Office">Office</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Full Name</Label>
                              <Input
                                value={addressForm.full_name}
                                onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                                placeholder="Recipient name"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                              placeholder="+880 1XXX-XXXXXX"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Address Line 1</Label>
                            <Input
                              value={addressForm.address_line1}
                              onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                              placeholder="Street address"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Address Line 2 (Optional)</Label>
                            <Input
                              value={addressForm.address_line2}
                              onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                              placeholder="Apartment, suite, etc."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>City</Label>
                              <Input
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                placeholder="City"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Postal Code</Label>
                              <Input
                                value={addressForm.postal_code}
                                onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                                placeholder="Postal code"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="is_default"
                              checked={addressForm.is_default}
                              onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                              className="rounded border-input"
                            />
                            <Label htmlFor="is_default" className="text-sm cursor-pointer">
                              Set as default address
                            </Label>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setAddressDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveAddress} disabled={saving || !addressForm.full_name || !addressForm.address_line1 || !addressForm.city}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Save Address
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground mb-4">No saved addresses yet</p>
                        <Button variant="outline" onClick={() => setAddressDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Address
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className="relative p-4 border rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {address.label === 'Home' ? (
                                  <Home className="w-4 h-4 text-primary" />
                                ) : address.label === 'Office' ? (
                                  <Building className="w-4 h-4 text-primary" />
                                ) : (
                                  <MapPin className="w-4 h-4 text-primary" />
                                )}
                                <span className="font-medium">{address.label}</span>
                                {address.is_default && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openEditAddress(address)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this delivery address.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteAddress(address.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                            <p className="font-medium">{address.full_name}</p>
                            {address.phone && (
                              <p className="text-sm text-muted-foreground">{address.phone}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              {address.address_line1}
                              {address.address_line2 && `, ${address.address_line2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.city}
                              {address.postal_code && ` - ${address.postal_code}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Cards Tab */}
            <TabsContent value="cards">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Saved Cards
                    </CardTitle>
                    <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Card
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add New Card</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label>Cardholder Name</Label>
                            <Input
                              value={cardForm.card_holder_name}
                              onChange={(e) => setCardForm({ ...cardForm, card_holder_name: e.target.value })}
                              placeholder="Name on card"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Card Number</Label>
                            <Input
                              value={cardForm.card_number}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                                const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
                                setCardForm({ ...cardForm, card_number: formatted });
                              }}
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Expiry Month</Label>
                              <Select
                                value={cardForm.expiry_month}
                                onValueChange={(value) => setCardForm({ ...cardForm, expiry_month: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                      {String(i + 1).padStart(2, '0')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Expiry Year</Label>
                              <Select
                                value={cardForm.expiry_year}
                                onValueChange={(value) => setCardForm({ ...cardForm, expiry_year: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="YYYY" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 10 }, (_, i) => {
                                    const year = new Date().getFullYear() + i;
                                    return (
                                      <SelectItem key={year} value={String(year)}>
                                        {year}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="is_default_card"
                              checked={cardForm.is_default}
                              onChange={(e) => setCardForm({ ...cardForm, is_default: e.target.checked })}
                              className="rounded border-input"
                            />
                            <Label htmlFor="is_default_card" className="text-sm cursor-pointer">
                              Set as default payment method
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Your card details are securely stored for faster checkout.
                          </p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setCardDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleSaveCard} 
                            disabled={saving || !cardForm.card_holder_name || cardForm.card_number.length < 19 || !cardForm.expiry_month || !cardForm.expiry_year}
                          >
                            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Save Card
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {paymentMethods.length === 0 ? (
                      <div className="text-center py-12">
                        <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground mb-4">No saved cards yet</p>
                        <Button variant="outline" onClick={() => setCardDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Card
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paymentMethods.map((card) => (
                          <div
                            key={card.id}
                            className="relative p-4 border rounded-lg bg-gradient-to-br from-secondary/50 to-secondary/20"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                <span className="font-medium">{card.card_brand}</span>
                                {card.is_default && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Card?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will remove this card from your saved payment methods.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCard(card.id)}>
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            <p className="font-mono text-lg tracking-wider mb-2">
                              •••• •••• •••• {card.card_last_four}
                            </p>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{card.card_holder_name}</span>
                              <span>
                                {String(card.expiry_month).padStart(2, '0')}/{String(card.expiry_year).slice(-2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Recent Orders
                    </CardTitle>
                    <Link to="/orders" className="text-primary text-sm hover:underline">
                      View All Orders
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground mb-4">No orders yet</p>
                        <Link to="/category/all">
                          <Button variant="outline">
                            Start Shopping
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => (
                          <Link
                            key={order.id}
                            to={`/orders/${order.id}`}
                            className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                          >
                            <div>
                              <p className="font-medium">
                                Order #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()} • {formatPrice(order.total_amount)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={statusColors[order.status]}>
                                {order.status}
                              </Badge>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default UserDashboard;
