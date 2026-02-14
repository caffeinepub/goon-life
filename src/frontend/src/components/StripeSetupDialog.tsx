import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSetStripeConfiguration } from '../hooks/useQueries';
import { toast } from 'sonner';

interface StripeSetupDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function StripeSetupDialog({ open, onClose }: StripeSetupDialogProps) {
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');
  const setConfig = useSetStripeConfiguration();

  const handleSave = async () => {
    if (!secretKey.trim()) {
      toast.error('Please enter your Stripe secret key');
      return;
    }

    const allowedCountries = countries.split(',').map(c => c.trim()).filter(Boolean);
    if (allowedCountries.length === 0) {
      toast.error('Please enter at least one country code');
      return;
    }

    try {
      await setConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      toast.success('Stripe configured successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to configure Stripe:', error);
      toast.error('Failed to configure Stripe. Please check your credentials.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Stripe Payment</DialogTitle>
          <DialogDescription>
            Enter your Stripe credentials to enable payments for Goon Fighter story mode.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Stripe Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              placeholder="sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
            <Input
              id="countries"
              placeholder="US,CA,GB"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Example: US,CA,GB,AU,DE
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={setConfig.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={setConfig.isPending}>
            {setConfig.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
