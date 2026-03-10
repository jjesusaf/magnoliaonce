"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Share2, X, Link2, Check, MessageCircle } from "lucide-react";

type Props = {
  productName: string;
  lang: string;
};

// Simple inline SVG icons for social platforms (no extra dependencies)
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

export function ShareButton({ productName, lang }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const modalRef = useRef<HTMLDialogElement>(null);
  const isEs = lang === "es";

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const shareText = isEs
    ? `Mira este arreglo de Magnolia Once: ${productName}`
    : `Check out this arrangement from Magnolia Once: ${productName}`;

  const handleShare = useCallback(async () => {
    // Try native Web Share API first (beautiful on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${productName} — Magnolia Once`,
          text: shareText,
          url,
        });
        return;
      } catch {
        // User cancelled or API failed — fall through to modal
      }
    }

    // Fallback: show modal
    setOpen(true);
    modalRef.current?.showModal();
  }, [productName, shareText, url]);

  const handleClose = () => {
    setOpen(false);
    modalRef.current?.close();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-5 w-5" />,
      color: "bg-[#25D366] text-white",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: <FacebookIcon className="h-5 w-5" />,
      color: "bg-[#1877F2] text-white",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "X",
      icon: <XTwitterIcon className="h-5 w-5" />,
      color: "bg-black text-white",
      href: `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: "Pinterest",
      icon: <PinterestIcon className="h-5 w-5" />,
      color: "bg-[#E60023] text-white",
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
    },
  ];

  return (
    <>
      <button
        onClick={handleShare}
        className="btn btn-ghost btn-circle"
        aria-label={isEs ? "Compartir" : "Share"}
      >
        <Share2 className="h-5 w-5 text-base-content/70" />
      </button>

      {/* Fallback modal for desktop / browsers without Web Share API */}
      <dialog
        ref={modalRef}
        className="modal modal-bottom sm:modal-middle"
        onClose={() => setOpen(false)}
      >
        {open && (
          <div className="modal-box max-w-sm p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-sm tracking-widest uppercase">
                {isEs ? "Compartir" : "Share"}
              </h3>
              <button
                onClick={handleClose}
                className="btn btn-ghost btn-circle btn-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Product name */}
            <p className="px-5 pb-4 text-sm text-base-content/60 line-clamp-1">
              {productName}
            </p>

            {/* Social grid */}
            <div className="grid grid-cols-4 gap-3 px-5 pb-4">
              {shareOptions.map((opt) => (
                <a
                  key={opt.name}
                  href={opt.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${opt.color} transition-transform group-hover:scale-110 group-active:scale-95`}
                  >
                    {opt.icon}
                  </div>
                  <span className="text-[10px] text-base-content/50">
                    {opt.name}
                  </span>
                </a>
              ))}
            </div>

            {/* Copy link */}
            <div className="border-t border-base-content/10 p-4">
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-base-200/60 hover:bg-base-200 transition-colors group"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success shrink-0" />
                ) : (
                  <Link2 className="h-4 w-4 text-base-content/50 shrink-0" />
                )}
                <span className="flex-1 text-left text-sm text-base-content/60 truncate">
                  {copied
                    ? isEs
                      ? "Link copiado!"
                      : "Link copied!"
                    : url}
                </span>
                {!copied && (
                  <span className="text-xs text-base-content/40 shrink-0 tracking-widest uppercase">
                    {isEs ? "Copiar" : "Copy"}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
