import React, { useState } from 'react';
import { Palette, Mail, Phone, Calendar, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

interface CommissionRequestFormProps {
  onSuccess?: () => void;
}

export const CommissionRequestForm: React.FC<CommissionRequestFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    commissionType: '',
    size: '',
    budget: '',
    timeline: '',
    description: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const commissionMutation = trpc.contact.submit.useMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.clientName.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.clientEmail.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.commissionType.trim()) {
      setError('Commission type is required');
      return;
    }
    if (!formData.budget.trim()) {
      setError('Budget is required');
      return;
    }
    if (!formData.timeline.trim()) {
      setError('Timeline is required');
      return;
    }

    setIsLoading(true);
    try {
      await commissionMutation.mutateAsync({
        name: formData.clientName.trim(),
        email: formData.clientEmail.trim(),
        phone: formData.clientPhone.trim() || undefined,
        subject: 'commission',
        message: formData.description.trim() || `Commission request: ${formData.commissionType.trim()}`,
        commissionType: formData.commissionType.trim(),
        commissionSize: formData.size.trim() || undefined,
        commissionBudget: formData.budget.trim(),
        commissionTimeline: formData.timeline.trim(),
      });
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          commissionType: '',
          size: '',
          budget: '',
          timeline: '',
          description: '',
        });
        setIsSubmitted(false);
        onSuccess?.();
      }, 3000);
    } catch (err) {
      setError('Failed to submit commission request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="max-w-2xl mx-auto my-8 p-8 bg-white rounded-2xl shadow-lg border border-gray-200 text-center">
        <div className="text-5xl mb-4">✨</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Commission Request Received!</h2>
        <p className="text-gray-600 text-lg">
          Thank you for your interest in commissioning a custom artwork. Jennefer will review your request and contact you within 48 hours to discuss your vision and next steps.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto my-8 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="w-8 h-8 text-accent" />
        <h2 className="text-3xl font-bold text-gray-900">Commission an Original Piece</h2>
      </div>
      <p className="text-gray-600 mb-6">
        Have a vision for a custom artwork? Jennefer creates personalized commissions tailored to your space and preferences. Fill out the form below to start the conversation.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="clientName" className="block text-sm font-semibold text-gray-700 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
            disabled={isLoading}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="clientEmail" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address *
          </label>
          <input
            type="email"
            id="clientEmail"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
            disabled={isLoading}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="clientPhone" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="clientPhone"
            name="clientPhone"
            value={formData.clientPhone}
            onChange={handleChange}
            placeholder="+27 123 456 789"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
            disabled={isLoading}
          />
        </div>

        {/* Commission Type */}
        <div>
          <label htmlFor="commissionType" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Commission Type *
          </label>
          <select
            id="commissionType"
            name="commissionType"
            value={formData.commissionType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
            disabled={isLoading}
          >
            <option value="">Select a type...</option>
            <option value="Portrait">Portrait</option>
            <option value="Landscape">Landscape</option>
            <option value="Wildlife">Wildlife</option>
            <option value="Still Life">Still Life</option>
            <option value="Custom">Custom/Other</option>
          </select>
        </div>

        {/* Size */}
        <div>
          <label htmlFor="size" className="block text-sm font-semibold text-gray-700 mb-2">
            Preferred Size (e.g., 60x80cm)
          </label>
          <input
            type="text"
            id="size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            placeholder="60 x 80 cm"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
            disabled={isLoading}
          />
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Budget Range *
          </label>
          <input
            type="text"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g., R 5,000 - R 15,000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
            disabled={isLoading}
          />
        </div>

        {/* Timeline */}
        <div>
          <label htmlFor="timeline" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Desired Timeline *
          </label>
          <select
            id="timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
            disabled={isLoading}
          >
            <option value="">Select a timeline...</option>
            <option value="1-2 months">1-2 months</option>
            <option value="2-3 months">2-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6+ months">6+ months</option>
            <option value="Flexible">Flexible</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Describe Your Vision
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell us about your vision, style preferences, subject matter, mood, or any reference images you'd like to share..."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isLoading ? 'Submitting...' : 'Submit Commission Request'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Jennefer will review your request and contact you within 48 hours to discuss pricing and next steps.
        </p>
      </form>
    </section>
  );
};
