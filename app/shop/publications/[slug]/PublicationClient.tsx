"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import type { RazorpayOptions, RazorpayResponse } from "@/lib/razorpay";
import "@/lib/razorpay"; // side-effect import for global Window type

interface PublicationPageProps {
  params: Promise<{ slug: string }>;
}

interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface PublicationItem {
  id?: string;
  title: string;
  slug: string;
  author: string;
  price: number;
  pages: number;
  language: string;
  isbn: string;
  description: string;
  longDescription: string;
  gradient?: string | null;
  coverImage?: string | null;
}

export default function PublicationClient({ params }: PublicationPageProps) {
  const { slug } = use(params);

  const [allPublications, setAllPublications] = useState<PublicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // States
  const [quantity, setQuantity] = useState(1);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [shipping, setShipping] = useState<ShippingDetails>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadPublications() {
      try {
        const res = await fetch("/api/publications");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAllPublications(json.data);
        }
      } catch (err) {
        console.error("Failed to load publications from API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPublications();
  }, []);

  const pub = allPublications.find((p) => p.slug === slug);

  if (loading) {
    return (
      <div className="min-h-screen gradient-warm flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 shadow-xl text-center max-w-md animate-fade-in">
          <div className="w-16 h-16 rounded-full gradient-saffron flex items-center justify-center mx-auto mb-6 animate-pulse-soft">
            <span className="text-3xl">📖</span>
          </div>
          <p className="font-heading text-xl font-bold text-forest-dark">
            Loading publication...
          </p>
        </div>
      </div>
    );
  }

  if (!pub) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col justify-between">
        <header className="glass sticky top-0 z-50 border-b border-gold-light/30 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="text-2xl" aria-hidden="true">🙏</span>
              <span className="font-heading text-lg font-bold text-forest-dark tracking-wide">
                Santhigiri Shop
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <h1 className="font-heading text-3xl font-bold text-forest-dark mb-4">Publication Not Found</h1>
          <p className="text-warm-gray mb-8">The publication you are looking for does not exist or has been moved.</p>
          <Link
            href="/#publications"
            className="inline-flex items-center gap-2 px-6 py-3 bg-saffron text-white rounded-full font-semibold shadow-lg hover:bg-saffron-dark transition-all duration-300"
          >
            ← Back to Publications
          </Link>
        </main>

        <footer className="bg-forest-dark text-white/80 py-6 text-center text-sm border-t border-gold/10">
          © {new Date().getFullYear()} Santhigiri Ashram. All rights reserved.
        </footer>
      </div>
    );
  }

  // Get recommendations (other books)
  const recommendations = allPublications.filter((p) => p.slug !== slug).slice(0, 3);

  // Validation
  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};
    if (!shipping.fullName.trim()) newErrors.fullName = "Full name is required";
    
    if (!shipping.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!shipping.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(shipping.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit Indian phone number";
    }

    if (!shipping.address.trim()) newErrors.address = "Address is required";
    if (!shipping.city.trim()) newErrors.city = "City is required";
    if (!shipping.state.trim()) newErrors.state = "State is required";
    
    if (!shipping.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(shipping.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Handle Input Changes
  function handleChange(field: keyof ShippingDetails, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setPaymentError("");
  }

  // Checkout Handler
  async function handleBuyNow() {
    if (!pub) return;

    if (!showCheckoutForm) {
      setShowCheckoutForm(true);
      return;
    }

    if (!validateForm()) return;

    setIsProcessing(true);
    setPaymentError("");

    const totalAmount = pub.price * quantity;

    try {
      // 1. Create order on the server
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          currency: "INR",
          receipt: `pub_${pub.slug.substring(0, 10)}_${Date.now()}`,
          notes: {
            product: pub.title,
            quantity: quantity.toString(),
            buyer: shipping.fullName,
            email: shipping.email,
            phone: shipping.phone,
            address: `${shipping.address}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}`,
          },
        }),
      });

      const order = await res.json();

      if (!res.ok) {
        throw new Error(order.error || "Failed to create order");
      }

      // 2. Open Razorpay Checkout popup
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: "Santhigiri Publications",
        description: `${pub.title} (Qty: ${quantity})`,
        order_id: order.id,
        prefill: {
          name: shipping.fullName,
          email: shipping.email,
          contact: `+91${shipping.phone}`,
        },
        theme: { color: "#1A3A25" }, // Forest Dark theme
        handler: async function (response: RazorpayResponse) {
          // 3. Verify payment on the server
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              setPaymentId(response.razorpay_payment_id);
            } else {
              setPaymentError(
                "Payment verification failed. Please contact support if the amount was deducted."
              );
            }
          } catch {
            setPaymentError(
              "Could not verify payment. Please contact support."
            );
          }
          setIsProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setPaymentError("Payment was cancelled. You can try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: unknown) {
      setIsProcessing(false);
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setPaymentError(message);
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-between">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-gold-light/30 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl" aria-hidden="true">🙏</span>
            <span className="font-heading text-lg font-bold text-forest-dark tracking-wide">
              Santhigiri Online Shop
            </span>
          </Link>
          <Link
            href="/#publications"
            className="text-sm text-warm-gray hover:text-saffron transition-colors flex items-center gap-1.5 font-medium"
          >
            ← Back to Publications
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* Success View */}
        {paymentId ? (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gold-light/20 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              ✅
            </div>
            <h1 className="font-heading text-3xl font-bold text-forest-dark mb-3">Order Placed Successfully!</h1>
            <p className="text-warm-gray mb-6 leading-relaxed">
              Thank you for your purchase. We have received your order for <strong>{pub.title}</strong> (Quantity: {quantity}).
              A confirmation email will be sent to <strong>{shipping.email}</strong> soon.
            </p>

            <div className="bg-cream rounded-2xl p-5 mb-8 text-left border border-cream-dark">
              <h3 className="font-bold text-forest-dark mb-3 text-sm uppercase tracking-wider">Order Details</h3>
              <ul className="space-y-2.5 text-sm text-forest-dark/90">
                <li className="flex justify-between">
                  <span className="text-warm-gray">Transaction ID:</span>
                  <span className="font-mono font-semibold">{paymentId}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-warm-gray">Deliver to:</span>
                  <span className="font-medium text-right">{shipping.fullName}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-warm-gray">Total Paid:</span>
                  <span className="font-bold text-saffron">₹{(pub.price * quantity).toLocaleString("en-IN")}</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/#publications"
                className="flex-1 px-6 py-3.5 bg-forest text-white rounded-full font-semibold text-center hover:bg-forest-dark transition duration-300"
              >
                Explore More Books
              </Link>
              <Link
                href="/"
                className="flex-1 px-6 py-3.5 bg-gold-light/30 text-forest-dark border border-gold-light/80 rounded-full font-semibold text-center hover:bg-gold-light/50 transition duration-300"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        ) : (
          /* Normal Details View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Book cover perspective */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group max-w-sm w-full aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden transition-transform duration-500 hover:scale-[1.02] flex items-center justify-center p-8 select-none" style={{ background: pub.gradient || undefined }}>
                {/* Embedded Book shadows and page simulation */}
                <div className="absolute top-0 bottom-0 left-0 w-3 bg-black/10 z-10 rounded-l-2xl" />
                <div className="absolute top-0 bottom-0 left-3 w-1 bg-white/10 z-10" />
                
                {/* Book design elements */}
                <div className="relative z-20 flex flex-col items-center justify-between h-full text-center text-white py-12 px-6">
                  <div className="text-saffron-light text-sm font-semibold tracking-[0.2em] uppercase">
                    Santhigiri Press
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-5xl mb-6 filter drop-shadow-md">📖</span>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight leading-snug">
                      {pub.title}
                    </h2>
                    <div className="w-12 h-0.5 bg-saffron-light/60 my-4" />
                    <p className="text-white/80 text-base italic">{pub.author}</p>
                  </div>

                  <div className="text-xs text-white/50 font-mono">
                    {pub.isbn}
                  </div>
                </div>

                {/* Mandala Background Pattern overlay */}
                <div className="absolute inset-0 mandala-pattern opacity-10 pointer-events-none" />
              </div>
            </div>

            {/* Right Column: Book Details & Actions */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Breadcrumbs */}
              <nav className="text-sm text-warm-gray-light flex items-center gap-2">
                <Link href="/" className="hover:text-saffron transition-colors">Home</Link>
                <span>/</span>
                <Link href="/#publications" className="hover:text-saffron transition-colors">Publications</Link>
                <span>/</span>
                <span className="text-warm-gray font-medium truncate max-w-[200px]">{pub.title}</span>
              </nav>

              <div>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-forest-dark mb-2 leading-tight">
                  {pub.title}
                </h1>
                <p className="text-warm-gray text-lg font-medium">By {pub.author}</p>
              </div>

              {/* Price Tag */}
              <div className="flex items-baseline gap-4 py-2 border-y border-gold-light/20">
                <span className="text-3xl font-bold text-saffron">₹{pub.price}</span>
                <span className="text-sm text-warm-gray-light font-medium">Inclusive of all taxes</span>
                <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 bg-cream border border-cream-dark text-forest text-xs font-semibold rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" /> In Stock
                </span>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-gold-light/20 shadow-sm text-center">
                <div>
                  <div className="text-xs text-warm-gray-light uppercase font-semibold">Language</div>
                  <div className="text-sm font-semibold text-forest-dark mt-1">{pub.language}</div>
                </div>
                <div>
                  <div className="text-xs text-warm-gray-light uppercase font-semibold">Pages</div>
                  <div className="text-sm font-semibold text-forest-dark mt-1">{pub.pages}</div>
                </div>
                <div>
                  <div className="text-xs text-warm-gray-light uppercase font-semibold">Format</div>
                  <div className="text-sm font-semibold text-forest-dark mt-1">Paperback</div>
                </div>
                <div>
                  <div className="text-xs text-warm-gray-light uppercase font-semibold">Publisher</div>
                  <div className="text-sm font-semibold text-forest-dark mt-1">Ashram Press</div>
                </div>
              </div>

              {/* Overview */}
              <div className="space-y-2">
                <h3 className="font-bold text-forest-dark uppercase tracking-wider text-sm">About the Book</h3>
                <p className="text-warm-gray leading-relaxed">{pub.longDescription}</p>
              </div>

              {/* Quantity Selector (Hide if checkout form shown to save space) */}
              {!showCheckoutForm && (
                <div className="flex items-center gap-4 py-3">
                  <span className="text-sm font-bold text-forest-dark">Quantity:</span>
                  <div className="flex items-center border border-gold-light rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-4 py-2 hover:bg-cream text-forest-dark transition-colors font-bold text-lg"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-5 font-bold text-forest-dark w-12 text-center select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="px-4 py-2 hover:bg-cream text-forest-dark transition-colors font-bold text-lg"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-warm-gray-light">Max 10 copies per order</span>
                </div>
              )}

              {/* Action and Checkout Forms */}
              {showCheckoutForm && (
                <div className="bg-white rounded-2xl p-6 border border-gold-light/30 shadow-md animate-fade-in-up space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gold-light/20">
                    <h3 className="font-bold text-forest-dark text-base uppercase tracking-wider">Shipping Details</h3>
                    <button 
                      onClick={() => setShowCheckoutForm(false)}
                      className="text-xs text-warm-gray hover:text-saffron transition-colors"
                    >
                      Change Quantity ({quantity})
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label htmlFor="fullName" className="text-xs font-semibold text-forest-dark">Full Name *</label>
                      <input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={shipping.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-forest ${
                          errors.fullName ? "border-red-500 bg-red-50/10" : "border-gold-light/50"
                        }`}
                      />
                      {errors.fullName && <p className="text-xs text-red-500 font-medium">{errors.fullName}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-xs font-semibold text-forest-dark">Email Address *</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={shipping.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-forest ${
                          errors.email ? "border-red-500 bg-red-50/10" : "border-gold-light/50"
                        }`}
                      />
                      {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label htmlFor="phone" className="text-xs font-semibold text-forest-dark">Phone Number (10-digit) *</label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        value={shipping.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-forest ${
                          errors.phone ? "border-red-500 bg-red-50/10" : "border-gold-light/50"
                        }`}
                      />
                      {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
                    </div>

                    {/* Pincode */}
                    <div className="space-y-1">
                      <label htmlFor="pincode" className="text-xs font-semibold text-forest-dark">Pincode (6-digit) *</label>
                      <input
                        id="pincode"
                        type="text"
                        placeholder="695584"
                        value={shipping.pincode}
                        onChange={(e) => handleChange("pincode", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-forest ${
                          errors.pincode ? "border-red-500 bg-red-50/10" : "border-gold-light/50"
                        }`}
                      />
                      {errors.pincode && <p className="text-xs text-red-500 font-medium">{errors.pincode}</p>}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-1">
                    <label htmlFor="address" className="text-xs font-semibold text-forest-dark">Street Address *</label>
                    <input
                      id="address"
                      type="text"
                      placeholder="Door No., Street Name, Locality"
                      value={shipping.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-forest ${
                        errors.address ? "border-red-500 bg-red-50/10" : "border-gold-light/50"
                      }`}
                    />
                    {errors.address && <p className="text-xs text-red-500 font-medium">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* City */}
                    <div className="space-y-1">
                      <label htmlFor="city" className="text-xs font-semibold text-forest-dark">City *</label>
                      <input
                        id="city"
                        type="text"
                        placeholder="Trivandrum"
                        value={shipping.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-forest ${
                          errors.city ? "border-red-500 bg-red-50/10" : "border-gold-light/50"
                        }`}
                      />
                      {errors.city && <p className="text-xs text-red-500 font-medium">{errors.city}</p>}
                    </div>

                    {/* State */}
                    <div className="space-y-1">
                      <label htmlFor="state" className="text-xs font-semibold text-forest-dark">State *</label>
                      <input
                        id="state"
                        type="text"
                        placeholder="Kerala"
                        value={shipping.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-forest ${
                          errors.state ? "border-red-500 bg-red-50/10" : "border-gold-light/50"
                        }`}
                      />
                      {errors.state && <p className="text-xs text-red-500 font-medium">{errors.state}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Error messages */}
              {paymentError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
                  ⚠️ {paymentError}
                </div>
              )}

              {/* Call to action button */}
              <div className="flex gap-4">
                <button
                  onClick={handleBuyNow}
                  disabled={isProcessing}
                  className="flex-grow inline-flex items-center justify-center gap-2 px-8 py-4 bg-saffron text-white rounded-full font-bold text-lg shadow-lg hover:bg-saffron-dark transition-all duration-300 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing Checkout...
                    </>
                  ) : showCheckoutForm ? (
                    `Proceed to Secure Payment • ₹${(pub.price * quantity).toLocaleString("en-IN")}`
                  ) : (
                    "Buy Now"
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Similar Books Section */}
        {recommendations.length > 0 && (
          <section className="mt-16 md:mt-24 pt-10 border-t border-gold-light/20">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-forest-dark mb-8 text-center sm:text-left">
              Other Sacred Publications
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recommendations.map((item) => (
                <Link
                  key={item.slug}
                  href={`/shop/publications/${item.slug}`}
                  className="group block card-hover bg-white rounded-2xl overflow-hidden border border-gold-light/10 shadow-sm p-4 hover:border-gold-light/30 transition-all duration-300"
                >
                  <div
                    className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-md mb-4 flex items-center justify-center p-4 text-center select-none"
                    style={{ background: item.gradient || undefined }}
                  >
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="text-3xl mb-3 opacity-30">📖</span>
                      <h4 className="font-heading text-base font-bold text-white leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-white/60 text-xs mt-1">{item.author}</p>
                    </div>
                    <div className="absolute inset-0 bg-forest-dark/0 group-hover:bg-forest-dark/40 transition-colors duration-300" />
                  </div>
                  
                  <h3 className="font-heading text-base font-bold text-forest-dark group-hover:text-saffron transition-colors duration-300 leading-snug mb-1 line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-warm-gray text-xs">By {item.author}</span>
                    <span className="text-sm font-bold text-saffron">₹{item.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-forest-dark text-white/60 py-10 mt-16 border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" aria-hidden="true">🙏</span>
            <span className="font-heading text-lg font-bold text-white tracking-wide">
              Santhigiri Ashram
            </span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Santhigiri Publications. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm font-medium">
            <Link href="/" className="hover:text-saffron transition-colors">Home</Link>
            <Link href="/donate" className="hover:text-saffron transition-colors">Donate</Link>
            <Link href="/pushpanjali" className="hover:text-saffron transition-colors">Pushpanjali</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
