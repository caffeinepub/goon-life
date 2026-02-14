import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUnlockWithPurchase, useGetStripeSessionStatus } from '../hooks/useQueries';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const unlockWithPurchase = useUnlockWithPurchase();
  const getSessionStatus = useGetStripeSessionStatus();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
          setError('No session ID found in URL');
          setProcessing(false);
          return;
        }

        // Verify session status
        const status = await getSessionStatus.mutateAsync(sessionId);

        if (status.__kind__ === 'completed') {
          // Unlock access
          await unlockWithPurchase.mutateAsync(sessionId);
          toast.success('Purchase completed successfully!');
          setProcessing(false);
        } else {
          setError('Payment was not completed');
          setProcessing(false);
        }
      } catch (err: any) {
        console.error('Payment processing error:', err);
        setError(err.message || 'Failed to process payment');
        setProcessing(false);
      }
    };

    processPayment();
  }, []);

  if (processing) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <CardTitle>Processing Payment</CardTitle>
            <CardDescription>
              Please wait while we verify your purchase...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="border-destructive/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle>Payment Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                If you were charged, please contact support. Otherwise, you can try purchasing again.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate({ to: '/story-mode' })}>
                Try Again
              </Button>
              <Button onClick={() => navigate({ to: '/' })}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="border-accent/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-accent" />
          </div>
          <CardTitle className="text-2xl">Purchase Successful!</CardTitle>
          <CardDescription>
            You now have full access to Goon Fighter story mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-accent/10 border-accent/30">
            <CheckCircle className="h-4 w-4 text-accent" />
            <AlertDescription>
              Your purchase has been confirmed and story mode is now unlocked.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button size="lg" onClick={() => navigate({ to: '/story-mode' })}>
              Start Playing Story Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
