"use client";

import React, { useState, useEffect } from "react";
import { Assets_Url, Image_Url } from "../../const";
import Hamburger from "../../components/Hamburger";
import { RxCross2 } from "react-icons/rx";
import { MdOutlineNavigateBefore } from "react-icons/md";
import Link from "next/link";
import { useCart } from "../../Context/CartContext";
import CustomSeo from "../../components/CustomSeo";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function Cart() {
    const { cartItems, removeFromCart, updateQuantity, updatePackSize, updateProductOption } = useCart();
    const [subtotal, setSubtotal] = useState(0);

    // Calculate subtotal
    useEffect(() => {
        const total = cartItems.reduce((sum, item) => {
            return sum + (Number(item.product_total) || 0);
        }, 0);
        setSubtotal(total);
    }, [cartItems]);

    const deliveryCharges = 0;
    const total = subtotal + deliveryCharges;

    // 📌 Helper function to format lid price
    const getLidPriceDisplay = (product) => {
        if (!product.lid_Price || product.lid_Price === 0) {
            return "No Lid";
        }
        return `Rs ${Number(product.lid_Price).toLocaleString()}`;
    };

    // 📌 Helper function to get printing/option price
    const getPrintingPriceDisplay = (product) => {
        // Check if there's a packaging option with price
        if (product.packaging_options?.price && Number(product.packaging_options.price) > 0) {
            return `Rs ${Number(product.packaging_options.price).toLocaleString()}`;
        }
        // Check if there's a direct option_Price
        if (product.option_Price && Number(product.option_Price) > 0) {
            return `Rs ${Number(product.option_Price).toLocaleString()}`;
        }
        return "No Printing";
    };

    // 📌 Helper function to check if quantity exceeds order limit
    const isOrderLimitExceeded = (product) => {
        if (product.order_limit && product.total_pieces) {
            return product.total_pieces > product.order_limit;
        }
        return false;
    };

    // 📌 Handle quantity update with order limit validation
    const handleQuantityUpdate = (product, newQuantity) => {
        const newTotalPieces = newQuantity * Number(product.pack_size || 1);
        
        if (product.order_limit && newTotalPieces > product.order_limit) {
            toast.error(`Order limit is ${product.order_limit} pieces. You cannot exceed this limit.`);
            return;
        }
        
        updateQuantity(product.id, newQuantity);
    };
  

    return (
        <div className="relative py-32 md:px-10 px-5 ">
            <ToastContainer autoClose={500} />
            <CustomSeo slug="cart" />

            <div className="text-white py-4">
                <Hamburger firstPage="Home" secondPage="Cart" />
                <h4 className="text-6xl pt-10 font-bazaar">Your Cart</h4>
            </div>

            <section className="text-white flex lg:flex-row flex-col-reverse lg:gap-10">
                {/* Desktop */}
                <div className="hidden md:flex flex-col w-full">
    {/* Header Section: Using Grid for perfect alignment */}
    <div className="grid grid-cols-12 gap-4 py-5 border-b border-gray-600 font-semibold text-gray-300 text-sm">
        <div className="col-span-3">Product</div>
        <div className="col-span-1 text-center">Pack Size</div>
        <div className="col-span-2 text-center">Quantity</div>
        <div className="col-span-2 text-center">Lid Price</div>
        <div className="col-span-1 text-center">Printing</div>
        <div className="col-span-1 text-center">Total Pcs</div>
        <div className="col-span-2 text-center">Total Price</div>
    </div>

    {cartItems.length === 0 && (
        <div className="flex justify-center py-10 text-4xl font-bazaar text-white">
            Your Cart is Empty
        </div>
    )}

    {cartItems.map((product) => {
        const limitExceeded = isOrderLimitExceeded(product);

        return (
            <div
                key={product.id}
                className="grid grid-cols-12 gap-4 py-6 border-t border-gray-600 items-center hover:bg-[#1a1a24] transition rounded-xl"
            >
                {/* Product Column (3 spans) */}
                <div className="col-span-3 flex items-center gap-4">
                    <button
                        className="text-white cursor-pointer hover:text-red-500 transition shrink-0"
                        onClick={() => removeFromCart(product.id)}
                    >
                        <RxCross2 size={18} />
                    </button>

                    <img
                        src={`${Assets_Url}${product.product_img}`}
                        alt={product.product_name}
                        className="w-20 h-16 border-2 border-[#1E7773] rounded-xl object-cover shrink-0"
                    />
                    <div className="truncate text-white text-sm">
                        {product.product_name}
                    </div>
                </div>

                {/* Pack Size Column (1 span) */}
                <div className="col-span-1 flex justify-center">
                    {product.product_variants?.length > 0 && (
                        <select
                            className="bg-[#20202C] border border-[#1E7773] rounded-lg w-full p-2 outline-none text-white text-xs"
                            value={product.pack_size}
                            onChange={(e) => updatePackSize(product.id, Number(e.target.value))}
                        >
                            {product.product_variants.map((variant) => (
                                <option key={variant.id} value={variant.pack_size}>
                                    {variant.pack_size}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Quantity Column (2 spans) */}
                <div className="col-span-2 flex justify-center">
                    <div className="flex justify-between items-center px-3 py-2 border border-[#1E7773] w-28 rounded-lg bg-[#20202C]">
                        <button
                            onClick={() => handleQuantityUpdate(product, Math.max(1, product.product_quantity - 1))}
                            className="text-white text-lg"
                        >
                            -
                        </button>
                        <input
                            type="text"
                            readOnly
                            value={product.product_quantity}
                            className="w-10 text-center bg-transparent border-none text-white font-medium"
                        />
                        <button
                            onClick={() => handleQuantityUpdate(product, product.product_quantity + 1)}
                            className="text-white text-lg"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Lid Price Column (2 spans) */}
                <div className="col-span-2 flex justify-center px-2">
                    <div className="border border-[#1E7773] rounded-lg text-center py-2 w-full bg-[#20202C]">
                        <span className="font-semibold text-white text-sm">
                            {product.lid_Price && product.lid_Price > 0 
                                ? `Rs ${Number(product.lid_Price).toLocaleString()}` 
                                : "No Lid"}
                        </span>
                    </div>
                </div>

                {/* Printing Price Column (1 span) */}
                <div className="col-span-1 flex justify-center">
                    <div className="border border-[#1E7773] rounded-lg text-center py-2 w-full bg-[#20202C]">
                        <span className="font-semibold text-white text-sm">
                            {product.printing_price && Number(product.printing_price) > 0 
                                ? `Rs ${Number(product.printing_price).toLocaleString()   }` 
                                : "N/A"}
                        </span>
                    </div>
                </div>

                {/* Total Pieces Column (1 span) */}
                <div className="col-span-1 flex justify-center text-white font-medium text-sm">
                    {product.total_pieces}
                </div>

                {/* Total Price Column (2 spans) */}
                <div className="col-span-2 text-xl font-bold text-white text-center">
                    Rs {Number(product.product_total).toLocaleString()}
                </div>
            </div>
        );
    })}
</div>

                {/* Mobile */}
                <div className="md:hidden flex flex-col w-full py-4">
                    {cartItems.length === 0 && (
                        <div className="flex justify-center py-10 text-4xl font-bazaar">
                            Your Cart is Empty
                        </div>
                    )}
                    {cartItems.map((product) => {
                        const limitExceeded = isOrderLimitExceeded(product);
                        
                        return (
                            <div key={product.id} className="flex gap-4 py-8 border-b border-gray-600">
                                <div className="flex items-start">
                                    <button className="mr-2 text-white" onClick={() => removeFromCart(product.id)}>
                                        <RxCross2 />
                                    </button>
                                    <img 
                                        src={`${Assets_Url}${product.product_img}`} 
                                        alt={product.product_name} 
                                        className="w-20 h-16 border-2 border-[#1E7773] rounded-xl object-cover" 
                                    />
                                </div>
                                <div className="flex flex-col gap-2 flex-1">
                                    <h4 className="font-semibold">{product.product_name}</h4>
                                    
                                    {/* Order limit warning */}
                                    {product.order_limit && (
                                        <p className="text-xs text-gray-400">
                                            Order limit: {product.order_limit} pcs
                                            {limitExceeded && (
                                                <span className="text-red-500 ml-2">Exceeded!</span>
                                            )}
                                        </p>
                                    )}
                                    
                                    {/* Lid Price */}
                                    {product.lid_Price && product.lid_Price > 0 && (
                                        <p className="text-sm">
                                            <span className="text-gray-400">Lid:</span> Rs {Number(product.lid_Price).toLocaleString()}/pc
                                        </p>
                                    )}
                                    
                                    {/* Printing Price */}
                                    {product.packaging_options?.price && Number(product.packaging_options.price) > 0 && (
                                        <p className="text-sm">
                                            <span className="text-gray-400">Printing:</span> Rs {Number(product.packaging_options.price).toLocaleString()}/pc
                                        </p>
                                    )}
                                    
                                    <p className="text-lg font-bold">Rs {Number(product.product_total).toLocaleString()}</p>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Qty:</span>
                                        <div className="flex items-center border border-[#1E7773] rounded-lg">
                                            <button 
                                                onClick={() => handleQuantityUpdate(product, Math.max(1, product.product_quantity - 1))} 
                                                className="px-2 py-1 text-white"
                                            >
                                                -
                                            </button>
                                            <span className="px-2 py-1">{product.product_quantity}</span>
                                            <button 
                                                onClick={() => handleQuantityUpdate(product, product.product_quantity + 1)} 
                                                className="px-2 py-1 text-white"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-400">
                                        Pack: {product.pack_size} Pcs × {product.product_quantity} = {product.total_pieces} total pcs
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Cart Summary */}
                <div className="border px-3 lg:border-none border-[#1E7773] rounded-lg flex flex-col justify-start py-5 gap-3 lg:w-1/5 md:w-1/2">
                    <h4 className="text-3xl font-semibold">Cart Totals</h4>
                    <div className="flex flex-col justify-start pt-5 gap-3">
                        <div className="flex justify-between text-lg">
                            <span>Subtotal:</span>
                            <span>Rs {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                            <span>Delivery Charges:</span>
                            <span>Rs {deliveryCharges.toLocaleString()}</span>
                        </div>
                        <hr className="border-gray-500" />
                        <div className="flex justify-between text-xl font-bold">
                            <span>Total:</span>
                            <span>Rs {total.toLocaleString()}</span>
                        </div>

                        <div className="flex flex-col gap-2 mt-5">
                            <Link href="/checkout/">
                                <button 
                                    disabled={cartItems.length === 0 || cartItems.some(item => isOrderLimitExceeded(item))}
                                    className={`w-full rounded-lg p-2 ${
                                        cartItems.length === 0 || cartItems.some(item => isOrderLimitExceeded(item))
                                            ? 'bg-gray-600 cursor-not-allowed' 
                                            : 'bg-[#1E7773] cursor-pointer'
                                    }`}
                                >
                                    PURCHASE
                                </button>
                            </Link>
                            <Link href="/shop/">
                                <button className="flex items-center justify-center border text-[12px] border-[#1E7773] w-full rounded-lg p-2">
                                    <MdOutlineNavigateBefore size={20} /> 
                                    <span className="ml-1 cursor-pointer">CONTINUE SHOPPING</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Cart;