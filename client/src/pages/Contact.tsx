import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, MapPin, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general" as "general" | "commission" | "purchase" | "other",
    message: "",
    commissionType: "",
    commissionSize: "",
    commissionBudget: "",
    commissionTimeline: "",
    commissionReferences: "",
  });

  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "general",
        message: "",
        commissionType: "",
        commissionSize: "",
        commissionBudget: "",
        commissionTimeline: "",
        commissionReferences: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate(formData);
  };

  const isCommission = formData.subject === "commission";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="lens-flare" style={{ top: '20%', right: '30%' }} />
        
        <div className="container relative z-10">
          <h1 className="heading-font text-6xl md:text-8xl gradient-text text-center mb-6 atmospheric-glow">
            GET IN TOUCH
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
            Have a question or interested in commissioning a piece? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-card border-border">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-background"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-background"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-background"
                      placeholder="+27 123 456 789"
                    />
                  </div>

                  <div>
                    <Label>Subject *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value: any) => setFormData({ ...formData, subject: value })}
                      required
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="commission">Commission Request</SelectItem>
                        <SelectItem value="purchase">Purchase Inquiry</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Commission-Specific Fields */}
                {isCommission && (
                  <div className="space-y-4 p-6 bg-muted/30 rounded-lg">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Commission Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Type of Artwork</Label>
                        <Input
                          value={formData.commissionType}
                          onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                          className="bg-background"
                          placeholder="e.g., Portrait, Landscape, Abstract"
                        />
                      </div>

                      <div>
                        <Label>Preferred Size</Label>
                        <Input
                          value={formData.commissionSize}
                          onChange={(e) => setFormData({ ...formData, commissionSize: e.target.value })}
                          className="bg-background"
                          placeholder="e.g., 24x36 inches"
                        />
                      </div>

                      <div>
                        <Label>Budget Range</Label>
                        <Input
                          value={formData.commissionBudget}
                          onChange={(e) => setFormData({ ...formData, commissionBudget: e.target.value })}
                          className="bg-background"
                          placeholder="e.g., R5000 - R10000"
                        />
                      </div>

                      <div>
                        <Label>Timeline</Label>
                        <Input
                          value={formData.commissionTimeline}
                          onChange={(e) => setFormData({ ...formData, commissionTimeline: e.target.value })}
                          className="bg-background"
                          placeholder="e.g., 2-3 months"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Reference Images or Inspiration</Label>
                      <Textarea
                        value={formData.commissionReferences}
                        onChange={(e) => setFormData({ ...formData, commissionReferences: e.target.value })}
                        className="bg-background"
                        rows={3}
                        placeholder="Describe your vision or provide links to reference images"
                      />
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <Label>Message *</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="bg-background"
                    rows={6}
                    placeholder="Tell us about your inquiry..."
                  />
                </div>

                <Button type="submit" size="lg" disabled={submitContact.isPending} className="w-full">
                  {submitContact.isPending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <a href="mailto:jennefer.ann.gg@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                      jennefer.ann.gg@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-medium text-foreground">Location</p>
                    <p className="text-muted-foreground">South Africa</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-medium text-foreground">WhatsApp</p>
                    <a 
                      href="https://wa.me/27846405120?text=Hi%20Jennefer%2C%20I%27m%20interested%20in%20commissioning%20an%20artwork." 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors font-semibold"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">Commission Process</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">1.</span>
                  <span>Submit your commission request with details</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">2.</span>
                  <span>We'll discuss your vision and provide a quote</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">3.</span>
                  <span>Upon agreement, a 50% deposit is required</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">4.</span>
                  <span>Creation begins with regular progress updates</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">5.</span>
                  <span>Final payment and delivery of your artwork</span>
                </li>
              </ol>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">Response Time</h3>
              <p className="text-sm text-muted-foreground">
                We typically respond to all inquiries within 24-48 hours. For commission requests, 
                we'll schedule a consultation to discuss your project in detail.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
