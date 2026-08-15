import React from 'react';
import { MessageCircle, ShoppingCart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ARTIST_WHATSAPP_PHONE, getWhatsAppLink } from '@/lib/galleryContact';

interface ProductPurchaseCardProps {
  artworkId?: number;
  artworkTitle: string;
  medium: string;
  dimensions: string;
  showArtworkIdentity?: boolean;
  priceZar?: string | number;
  priceUsd?: string | number;
  isAvailable: boolean;
  isSold?: boolean;
  checkoutUrl?: string;
  fullPaymentLink?: string;
  depositPaymentLink?: string;
  depositPercentage?: number;
  artistPhone?: string;
}

export const ProductPurchaseCard: React.FC<ProductPurchaseCardProps> = ({
  artworkId,
  artworkTitle,
  medium,
  dimensions,
  showArtworkIdentity = true,
  priceZar,
  priceUsd,
  isAvailable,
  isSold = false,
  checkoutUrl,
  fullPaymentLink,
  depositPaymentLink,
  depositPercentage = 30,
  artistPhone = ARTIST_WHATSAPP_PHONE,
}) => {
  const enquiryMessage = `Hi Jennefer, I am interested in "${artworkTitle}" (${priceZar ? `R${priceZar}` : 'Price on request'}). Is it still available?`;
  const reservationMessage = `Hi Jennefer, I would like to reserve "${artworkTitle}" with a ${depositPercentage}% deposit. Please let me know the next step.`;
  const normalizedArtistPhone = artistPhone?.replace(/[^0-9]/g, '');
  const whatsappLink = normalizedArtistPhone
    ? getWhatsAppLink(enquiryMessage)
    : `/contact?subject=purchase&artwork=${encodeURIComponent(artworkTitle)}`;
  const reservationLink = depositPaymentLink || (
    normalizedArtistPhone
      ? getWhatsAppLink(reservationMessage)
      : `/contact?subject=purchase&artwork=${encodeURIComponent(artworkTitle)}&request=deposit`
  );
  const purchaseLink = fullPaymentLink || checkoutUrl;

  const availabilityBadge = isSold ? (
    <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
      <div className="w-3 h-3 bg-red-600 rounded-full" />
      SOLD
    </div>
  ) : isAvailable ? (
    <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
      <div className="w-3 h-3 bg-green-600 rounded-full" />
      AVAILABLE — Original artwork
    </div>
  ) : (
    <div className="flex items-center gap-2 text-gray-500 font-bold text-lg">
      <div className="w-3 h-3 bg-gray-400 rounded-full" />
      INQUIRE FOR AVAILABILITY
    </div>
  );

  return (
    <section className="max-w-2xl mx-auto my-8 p-7 bg-white rounded-2xl shadow-lg border border-gray-200">
      {/* Availability Status */}
      <div className="mb-6">{availabilityBadge}</div>

      {/* Title and Metadata */}
      {showArtworkIdentity && (
        <>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{artworkTitle}</h2>
          <p className="text-gray-600 text-base mb-4">
            {medium && dimensions ? `${medium} · ${dimensions}` : medium || dimensions || 'Original artwork'}
          </p>
        </>
      )}

      {/* Price */}
      {priceZar || priceUsd ? (
        <div className="mb-6">
          {priceZar && (
            <p className="text-3xl font-bold text-gray-900">
              R {typeof priceZar === 'number' ? priceZar.toLocaleString() : priceZar}
            </p>
          )}
          {priceUsd && (
            <p className="text-lg text-gray-600">
              ${typeof priceUsd === 'number' ? priceUsd.toLocaleString() : priceUsd} USD
            </p>
          )}
        </div>
      ) : (
        <p className="text-2xl font-bold text-gray-700 mb-6">Price available on request</p>
      )}

      {/* Action Buttons */}
      {!isSold && isAvailable && (
        <div className="space-y-3 mb-6">
          {purchaseLink && (
            <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg">
              <a
                href={purchaseLink}
                data-analytics-event="click_checkout"
                data-analytics-target={artworkTitle}
                data-artwork-id={artworkId}
                {...(fullPaymentLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <ShoppingCart className="w-5 h-5" />
                Buy Now Securely
              </a>
            </Button>
          )}

          <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg">
            <a
              href={reservationLink}
              data-analytics-event="click_reserve"
              data-analytics-target={artworkTitle}
              data-artwork-id={artworkId}
              {...(depositPaymentLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
                <Clock className="w-5 h-5" />
                Reserve with {depositPercentage}% Deposit
            </a>
          </Button>
        </div>
      )}

      {/* WhatsApp Button */}
      <Button asChild className="w-full bg-green-100 hover:bg-green-200 text-green-700 font-bold py-3 rounded-lg">
        <a
          href={whatsappLink}
          data-analytics-event="click_whatsapp"
          data-analytics-target={artworkTitle}
          data-artwork-id={artworkId}
          {...(normalizedArtistPhone ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <MessageCircle className="w-5 h-5" />
          {normalizedArtistPhone ? 'Ask on WhatsApp' : 'Enquire about this artwork'}
        </a>
      </Button>

      {/* Features List */}
      <ul className="mt-6 space-y-3 text-gray-700">
        <li className="flex items-start gap-3">
          <span className="text-accent font-bold mt-1">✓</span>
          <span>Signed certificate of authenticity included</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-accent font-bold mt-1">✓</span>
          <span>Secure payment processing</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-accent font-bold mt-1">✓</span>
          <span>South African collection or delivery available</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-accent font-bold mt-1">✓</span>
          <span>International shipping quote on request</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-accent font-bold mt-1">✓</span>
          <span>Estimated dispatch: 3–7 working days</span>
        </li>
      </ul>
    </section>
  );
};
