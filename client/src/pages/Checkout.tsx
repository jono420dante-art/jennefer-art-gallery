import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CreditCard, Wallet, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Checkout() {
  const params = useParams();
  const [, navigate] = useLocation();
  const artworkSlug = params.slug as string;

  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "mastercard">("paypal");
  const [formData, setFormData] = useState({
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    shippingAddress: "",
    notes: "",
  });

  const { data: artwork, isLoading: artworkLoading } = trpc.artworks.getBySlug.useQuery({
    slug: artworkSlug,
  });

  const { data: paymentSettings } = trpc.paymentSettings.get.useQuery();

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success("Order created successfully! Redirecting to payment...");
      setTimeout(() => {
        if (paymentMethod === "paypal" && paymentSettings?.paypalEmail) {
          // Redirect to PayPal
          window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${paymentSettings.paypalEmail}&item_name=${artwork?.title}&amount=${artwork?.priceUsd || artwork?.priceZar}&currency_code=${artwork?.priceUsd ? "USD" : "ZAR"}`;
        } else {
          toast.success("Payment information has been sent. Please check your email for payment instructions.");
          navigate("/gallery");
        }
      }, 1500);
    },
    onError: (error) => {
      toast.error("Failed to create order. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.buyerName || !formData.buyerEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!artwork) {
      toast.error("Artwork not found");
      return;
    }

    createOrder.mutate({
      artworkId: artwork.id,
      buyerName: formData.buyerName,
      buyerEmail: formData.buyerEmail,
      buyerPhone: formData.buyerPhone,
      amount: String(artwork.priceUsd || artwork.priceZar),
      currency: artwork.priceUsd ? "USD" : "ZAR",
      paymentMethod,
      shippingAddress: formData.shippingAddress,
      notes: formData.notes,
    });
  };

  if (artworkLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading artwork details...</p>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Artwork not found</p>
          <Link href="/gallery">
            <Button>Back to Gallery</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container py-12">
        {/* Back Button */}
        <Link href={`/artwork/${artwork.slug}`}>
          <Button variant="ghost" className="mb-8">
            <ArrowLeft size={16} className="mr-2" />
            Back to Artwork
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Artwork Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-border bg-card sticky top-8">
              <div className="aspect-square mb-6 overflow-hidden rounded-lg">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="heading-font text-2xl text-foreground mb-2">{artwork.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{artwork.description}</p>

              <div className="space-y-2 mb-6 pb-6 border-b border-border">
                {artwork.dimensions && (
                  <p className="text-sm">
                    <span className="font-semibold">Dimensions:</span> {artwork.dimensions}
                  </p>
                )}
                {artwork.medium && (
                  <p className="text-sm">
                    <span className="font-semibold">Medium:</span> {artwork.medium}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Price:</span>
                  <span className="text-lg text-accent font-bold">
                    {artwork.priceZar && `R ${artwork.priceZar}`}
                    {artwork.priceUsd && artwork.priceZar && " / "}
                    {artwork.priceUsd && `$${artwork.priceUsd}`}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 border-border bg-card">
              <h2 className="heading-font text-4xl gradient-text mb-8">CHECKOUT</h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Buyer Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-foreground">Buyer Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.buyerName}
                        onChange={(e) =>
                          setFormData({ ...formData, buyerName: e.target.value })
                        }
                        className="bg-muted border-border"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        required
                        value={formData.buyerEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, buyerEmail: e.target.value })
                        }
                        className="bg-muted border-border"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        value={formData.buyerPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, buyerPhone: e.target.value })
                        }
                        className="bg-muted border-border"
                        placeholder="Your phone number"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Shipping Address
                      </label>
                      <Textarea
                        value={formData.shippingAddress}
                        onChange={(e) =>
                          setFormData({ ...formData, shippingAddress: e.target.value })
                        }
                        className="bg-muted border-border"
                        placeholder="Street, City, Postal Code, Country"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Special Notes
                      </label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        className="bg-muted border-border"
                        placeholder="Any special requests or notes..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-foreground">Payment Method</h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-muted/50 transition"
                      style={{
                        borderColor: paymentMethod === "paypal" ? "var(--accent)" : "var(--border)",
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={(e) => setPaymentMethod(e.target.value as "paypal")}
                        className="w-4 h-4 mr-4"
                      />
                      <Wallet size={20} className="mr-3 text-accent" />
                      <div>
                        <p className="font-semibold text-foreground">PayPal</p>
                        <p className="text-sm text-muted-foreground">Secure payment via PayPal</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-muted/50 transition"
                      style={{
                        borderColor: paymentMethod === "mastercard" ? "var(--accent)" : "var(--border)",
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mastercard"
                        checked={paymentMethod === "mastercard"}
                        onChange={(e) => setPaymentMethod(e.target.value as "mastercard")}
                        className="w-4 h-4 mr-4"
                      />
                      <CreditCard size={20} className="mr-3 text-accent" />
                      <div>
                        <p className="font-semibold text-foreground">MasterCard</p>
                        <p className="text-sm text-muted-foreground">Direct card payment</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? "Processing..." : "Proceed to Payment"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your payment information is secure and encrypted. We never store your card details.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
