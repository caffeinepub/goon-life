import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreateGamePurchaseSession } from '../hooks/useQueries';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

export default function BuyGoonFighterButton() {
  const createSession = useCreateGamePurchaseSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsRedirecting(true);
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;

      const sessionJson = await createSession.mutateAsync({ successUrl, cancelUrl });
      const session = JSON.parse(sessionJson) as { id: string; url: string };

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to start purchase. Please try again.');
      setIsRedirecting(false);
    }
  };

  return (
    <Button
      onClick={handlePurchase}
      disabled={createSession.isPending || isRedirecting}
      size="lg"
      className="gap-2 text-lg px-8 py-6"
    >
      <ShoppingCart className="h-5 w-5" />
      {createSession.isPending || isRedirecting ? 'Redirecting to checkout...' : 'Buy Goon Fighter - $3.99'}
    </Button>
  );
}
