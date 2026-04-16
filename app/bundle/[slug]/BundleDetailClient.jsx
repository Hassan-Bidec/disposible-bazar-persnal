"use client";

import { useState } from "react";
import { Assets_Url } from "../../src/const";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "../../src/Context/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiX } from "react-icons/fi";
import CartModal from "../../src/components/cart/CartModal";
import DecodeTextEditor from "../../src/components/DecodeTextEditor";

export default function BundleDetailClient({ initialBundle, slug }) {
  const bundle = initialBundle;

  const [selectedImage, setSelectedImage] = useState(
    bundle?.bundle_images?.[0]?.image || ""
  );
  const [subQuantity, setSubQuantity] = useState(1);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const { addToCart } = useCart();

  const handleAddCart = () => {
    if (!bundle) return;
    const total = (Number(bundle.payable_amount) * Number(subQuantity)).toFixed(2);
    addToCart(
      bundle.id, bundle.name, subQuantity,
      1, subQuantity,
      Number(bundle.payable_amount),
      selectedImage, total,
      null, null, null, null, null, null, null, null, null, null, 0, true, 1000
    );
    setIsCartModalOpen(true);
  };

  const whatsappNumber = "+923213850002";
  const productUrl = typeof window !== "undefined" ? window.location.href : "";
  const inquiryMessage = encodeURIComponent(
    `Hello! I am interested in this bundle:\n\n${bundle?.name}\n\n${productUrl}`
  );

  if (!bundle) {
    return (
      <div className="relative py-30 px-10 text-white">
        <p>Bundle not found.</p>
      </div>
    );
  }

  return (
    <div className="relative py-30 px-10 text-white overflow-hidden">
      <ToastContainer autoClose={500} />

      {/* Breadcrumb */}
      <div className="flex flex-col py-5">
        <p>
          <Link href="/">Home</Link> / <Link href="/bundles/">Bundles</Link> / {bundle.name}
        </p>
      </div>

      <main>
        <section className="flex lg:flex-row flex-col gap-8">
          {/* Images */}
          <div className="lg:w-3/5 md:h-[34rem] h-[20rem] flex flex-row gap-2">
            <div className="w-1/5 flex flex-col gap-1">
              {(bundle.bundle_images || []).map((img, i) => (
                <div key={i} className="w-full h-1/4 py-1">
                  <img
                    className="w-full h-full bg-[#32303e] rounded-xl border-2 border-[#1E7773] object-cover cursor-pointer"
                    src={`${Assets_Url}${img.image}`}
                    alt={bundle.name}
                    onClick={() => setSelectedImage(img.image)}
                  />
                </div>
              ))}
            </div>
            <div className="w-4/5 rounded-lg bg-[#32303e]">
              {selectedImage && (
                <img
                  className="w-full h-full object-cover rounded-lg"
                  src={`${Assets_Url}${selectedImage}`}
                  alt={bundle.name}
                />
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:w-2/5 flex flex-col gap-5 text-white">
            <h1 className="md:text-5xl text-3xl font-semibold">{bundle.name}</h1>

            {bundle.bundle_items?.length > 0 && (
              <div className="border border-[#1E7773] rounded-lg">
                <p className="bg-[#1E7773] rounded-t-lg py-1 px-5">Products</p>
                <div className="p-3 flex flex-col gap-1">
                  {bundle.bundle_items.map((p) => (
                    <p key={p.id}>
                      {p.product?.name} — {p.quantity} pcs — Price {p.price}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <div className="border border-[#1E7773] rounded-md flex justify-between items-center px-2 w-24 h-10">
                <button disabled={subQuantity === 1} onClick={() => setSubQuantity((p) => p - 1)}>-</button>
                <p>{subQuantity}</p>
                <button onClick={() => setSubQuantity((p) => p + 1)}>+</button>
              </div>
              <button
                className="p-2 bg-[#1E7773] w-full cursor-pointer rounded-md"
                onClick={handleAddCart}
              >
                ADD TO CART
              </button>
            </div>

            <p className="text-lg">
              Rs {bundle.payable_amount ? Number(bundle.payable_amount) * subQuantity : "0"}
            </p>

            <button
              className="p-3 border flex items-center gap-2 border-[#1E7773] rounded-md"
              onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=${inquiryMessage}`, "_blank")}
            >
              <FaWhatsapp className="text-[#1E7773] text-2xl" /> ORDER ON WHATSAPP
            </button>
          </div>
        </section>

        <section className="py-10">
          <h2 className="border-b border-[#1E7773] pb-2 text-xl">Product Description</h2>
          <div className="mt-3">
            {bundle.description ? (
              <DecodeTextEditor body={bundle.description} />
            ) : (
              <p>No Description Found</p>
            )}
          </div>
        </section>
      </main>

      {isCartModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50"
          onClick={() => setIsCartModalOpen(false)}
        >
          <div className="bg-white p-4 rounded-lg w-[300px] text-black" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between">
              <h4 className="font-bold">Added to Cart</h4>
              <FiX size={24} onClick={() => setIsCartModalOpen(false)} />
            </div>
            <CartModal />
            <div className="flex gap-2 mt-3">
              <Link href="/shop/" className="border border-[#1E7773] w-full text-center p-1 rounded-md text-[#1E7773]">CONTINUE</Link>
              <Link href="/cart/" className="bg-[#1E7773] w-full text-center p-1 rounded-md text-white">CART</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
