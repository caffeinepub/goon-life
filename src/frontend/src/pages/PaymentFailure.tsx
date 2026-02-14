import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, AlertCircle } from 'lucide-react';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="border-destructive/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>
            Your purchase was not completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No charges were made to your account. You can try purchasing again when you're ready.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              Go Home
            </Button>
            <Button onClick={() => navigate({ to: '/story-mode' })}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
