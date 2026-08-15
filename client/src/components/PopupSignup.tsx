import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAnalytics } from '@/hooks/useAnalytics';
import { dismissCollectorSignup, wasCollectorSignupDismissed } from '@/lib/collectorSignup';

interface PopupSignupProps {
  onClose?: () => void;
}

export const PopupSignup: React.FC<PopupSignupProps> = ({ onClose }) => {
  const { trackEvent } = useAnalytics();
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(() => wasCollectorSignupDismissed());
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const signupMutation = trpc.newsletter.signup.useMutation();

  useEffect(() => {
    if (hasDismissed) return;

    const timer = window.setTimeout(() => setIsOpen(true), 3000);
    const handleScroll = () => {
      const availableScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = availableScroll > 0 ? (window.scrollY / availableScroll) * 100 : 0;
      if (scrollPercent > 30 && !isOpen) setIsOpen(true);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasDismissed, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setHasDismissed(true);
    dismissCollectorSignup();
    setFormData({ firstName: '', lastName: '', email: '' });
    setIsSubmitted(false);
    setError('');
    onClose?.();
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!formData.firstName.trim()) return setError('First name is required.');
    if (!formData.lastName.trim()) return setError('Last name is required.');
    if (!formData.email.trim()) return setError('Email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return setError('Please enter a valid email address.');

    setIsLoading(true);
    try {
      await signupMutation.mutateAsync({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
      });
      trackEvent('click_newsletter', 'newsletter_signup_submitted');
      setIsSubmitted(true);
      window.setTimeout(handleClose, 3000);
    } catch {
      setError('We could not save your place in the collector circle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default bg-black/50 backdrop-blur-[2px]"
        aria-label="Close collector signup and continue browsing"
        onClick={handleClose}
      />

      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="collector-signup-title"
          className="pointer-events-auto relative my-auto w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/80 bg-gradient-to-b from-[#fffaf8] via-white to-[#fff1f4] shadow-[0_24px_80px_rgba(30,15,18,0.45)] animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="h-2 bg-gradient-to-r from-[#b8335f] via-[#ef6b93] to-[#f3b256]" />
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-5 grid h-10 w-10 place-items-center rounded-full border border-[#d8b2bd] bg-white/95 text-[#70213a] shadow-sm transition hover:scale-105 hover:bg-[#fff0f4] focus:outline-none focus:ring-2 focus:ring-[#d64c75] focus:ring-offset-2"
            aria-label="Close collector signup and keep exploring"
            title="Close and keep exploring"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>

          {isSubmitted ? (
            <div className="p-8 text-center sm:p-10">
              <div className="mb-4 flex justify-center"><CheckCircle className="h-16 w-16 text-[#c54369]" /></div>
              <h2 id="collector-signup-title" className="mb-2 font-serif text-3xl font-bold text-[#3a1722]">You’re on the studio list.</h2>
              <p className="text-[#6b4b54]">New work, intimate process notes and first invitations will arrive in your inbox before the gallery crowd sees them.</p>
            </div>
          ) : (
            <div className="p-8 pt-9 sm:p-10 sm:pt-10">
              <div className="mb-7 pr-10">
                <p className="mb-3 text-[11px] font-bold tracking-[0.2em] text-[#b8335f]">JENNEFER ANN / COLLECTOR NOTES</p>
                <h2 id="collector-signup-title" className="mb-3 font-serif text-3xl font-bold leading-[1.05] text-[#35131f]">Step inside the studio before the canvas leaves it.</h2>
                <p className="text-sm leading-6 text-[#6b4b54]">A quiet line to new originals, limited releases and commission moments—made for people who collect art with feeling.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-[#51303a]">First Name</label>
                  <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Your first name" disabled={isLoading} className="w-full rounded-xl border border-[#dec4cb] bg-white/80 px-4 py-3 text-[#35131f] placeholder:text-[#9b7e86] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#d64c75]" />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-[#51303a]">Last Name</label>
                  <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Your last name" disabled={isLoading} className="w-full rounded-xl border border-[#dec4cb] bg-white/80 px-4 py-3 text-[#35131f] placeholder:text-[#9b7e86] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#d64c75]" />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#51303a]">Email Address</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" disabled={isLoading} className="w-full rounded-xl border border-[#dec4cb] bg-white/80 px-4 py-3 text-[#35131f] placeholder:text-[#9b7e86] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#d64c75]" />
                </div>

                {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3"><p className="text-sm text-red-700">{error}</p></div>}

                <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-[#c54369] py-3.5 font-semibold text-white shadow-[0_10px_24px_rgba(197,67,105,0.28)] transition duration-200 hover:bg-[#a92d51] active:scale-[0.98] disabled:bg-[#d790a6]">
                  {isLoading ? 'Opening the studio door…' : 'Enter the Collector Circle'}
                </button>
                <button type="button" onClick={handleClose} className="w-full rounded-xl py-1 text-sm font-medium text-[#7a5160] transition hover:text-[#b8335f] focus:outline-none focus:ring-2 focus:ring-[#d64c75]">
                  Not now — keep exploring the artwork
                </button>
                <p className="text-center text-xs text-[#8b7078]">Thoughtful updates only. Leave the circle whenever you wish.</p>
              </form>
            </div>
          )}
        </section>
      </div>
    </>
  );
};
