"use client";
import { useEffect, useState, useRef } from "react";
import PriceRange from "../components/Shop/PriceRange";
import { Assets_Url, Image_Not_Found, Image_Url } from "../const";
import { RiFilter3Line } from "react-icons/ri";
import PriceRangeMob from "../components/Shop/PriceRangeMob";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "../Utils/axios";
import { Loader } from "../components/Loader";
import { useCart } from "../Context/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartModal from "../components/cart/CartModal";
import { FiX } from "react-icons/fi";
import Image from "next/image";

export default function ShopClient({ initialProducts = [], initialCategories = [] }) {
  const params = useParams();
  const category = params?.category;
  const searchParams = useSearchParams();
  const searchTermFromURL = searchParams.get("q");

  // Read initial page from URL path e.g. /shop/3
  const getInitialPage = () => {
    if (typeof window === "undefined") return 1;
    const segments = window.location.pathname.replace(/\/$/, "").split("/");
    const last = segments[segments.length - 1];
    return last && /^\d+$/.test(last) ? parseInt(last) : 1;
  };

  const [grid, setGrid] = useState(3);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [filteredProduct, setFilteredProduct] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState(searchTermFromURL || "");
  const [filter, setFilter] = useState({
    price_from: 0,
    price_to: 0,
    sort_by: 1,
    category_Id: category || undefined,
  });
  const [isFilter, setIsFilter] = useState(false);
  const { addToCart } = useCart();
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const isFirstMount = useRef(true);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [hoveredProductId, setHoveredProductId] = useState(null);

  // Set initial page from URL on mount
  useEffect(() => {
    setCurrentPage(getInitialPage());
  }, []);

  // ─── URL update — ?product-page=2 format, no remount ────────────────────
  const goToPage = (newPage) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(window.location.search);
    if (newPage <= 1) {
      params.delete("product-page");
    } else {
      params.set("product-page", String(newPage));
    }
    const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
    window.scrollTo({ top: 450, behavior: "smooth" });
  };

  // ─── Resize ───────────────────────────────────────────────────────────────
  const handleResize = () => {
    const w = window.innerWidth;
    if (w < 400) setGrid(1);
    else if (w < 768) setGrid(2);
    else setGrid(3);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Sort ─────────────────────────────────────────────────────────────────
  const sortProducts = (data, sortType) =>
    [...data].sort((a, b) => {
      if (sortType === 1) return a.name.localeCompare(b.name);
      if (sortType === 2) return b.name.localeCompare(a.name);
      return 0;
    });

  // ─── Fetch (client-side, triggered by filters/search) ────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.public.get("search/product", {
        params: {
          price_from: filter.price_from,
          price_to: filter.price_to,
          sort_by: filter.sort_by,
          category_id: filter.category_Id,
          name: searchTerm,
          search: searchTerm ? true : false,
        },
      });
      let data = response.data?.data || [];
      if (!Array.isArray(data) && data?.is_customizeable) {
        data = data.is_customizeable;
      }
      setFilteredProduct(sortProducts(data, filter.sort_by));
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sync search term from URL
  useEffect(() => {
    const newSearch = searchTermFromURL || "";
    if (newSearch !== searchTerm) {
      setSearchTerm(newSearch);
      if (!isFirstMount.current) goToPage(1);
    }
  }, [searchTermFromURL]);

  // Sync category
  useEffect(() => {
    setFilter((prev) => ({ ...prev, category_Id: category || undefined }));
    if (!isFirstMount.current) goToPage(1);
    isFirstMount.current = false;
  }, [category]);

  // Re-fetch on filter/search change
  useEffect(() => {
    if (searchTerm || filter.price_from > 0 || filter.price_to > 0 || filter.category_Id) {
      const t = setTimeout(fetchData, 300);
      return () => clearTimeout(t);
    }
  }, [filter, searchTerm]);

  // Initial fetch if no SSR products passed
  useEffect(() => {
    if (initialProducts.length === 0) fetchData();
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleFilter = (filters) => {
    setFilter({
      ...filter,
      price_from: filters.price_from || filter.price_from,
      price_to: filters.price_to || filter.price_to,
      sort_by: filters.selected || filter.sort_by,
      category_Id: filters.category_Id || filter.category_Id,
    });
    goToPage(1);
  };

  const handleAddCartClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowQtyModal(true);
  };

  const confirmAddToCart = () => {
    if (!selectedProduct) return;
    const product = selectedProduct;
    const variant = product.product_variants?.[0];
    if (!variant) return;
    const pack_size = Number(variant.pack_size ?? 1);
    const product_quantity = Number(quantity ?? 1);
    const total_pieces = pack_size * product_quantity;
    const price_per_piece = Number(variant.price_per_piece ?? variant.price ?? 0);
    const product_total = (price_per_piece * total_pieces).toFixed(2);
    addToCart(
      product.id, product.name, product_quantity, pack_size, total_pieces,
      price_per_piece, product.product_image?.[0]?.image ?? "",
      product_total, product.product_variants
    );
    setIsCartModalOpen(true);
    setShowQtyModal(false);
  };

  // ─── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredProduct.length / itemsPerPage);

  const getPaginationPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (currentPage > totalPages - 4)
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="lg:px-10 px-0 flex">
      <ToastContainer autoClose={500} />

      <section className="hidden lg:flex flex-col p-5 text-white lg:w-1/5">
        <PriceRange onFilter={handleFilter} isCategoryShown={true} initialCategories={initialCategories} />
      </section>

      <div>
        <PriceRangeMob
          onFilter={handleFilter}
          isFilter={isFilter}
          setIsFilter={setIsFilter}
          isCategoryShown={true}
          initialCategories={initialCategories}
        />
      </div>

      <section className="flex p-5 lg:w-4/5 w-full">
        <div className="py-4 w-full flex flex-col text-white rounded-lg">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h1 className="text-4xl font-bazaar">
                {filter.category_Id ? filteredProduct[0]?.category?.name : "Shop All"}
              </h1>
              <button onClick={() => setIsFilter(true)}>
                <RiFilter3Line className="lg:hidden block text-4xl rounded-full p-2 bg-[#1E7773]" />
              </button>
            </div>
            <p className="text-sm text-gray-400">
              <Link href="/">Home</Link> / <Link href="/shop">Shop</Link>
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader /></div>
          ) : filteredProduct.length === 0 ? (
            <div className="flex justify-center items-center h-screen">
              <h2 className="text-4xl font-bazaar">No products found</h2>
            </div>
          ) : (
            <>
              <div className={`py-10 grid ${
                grid === 4 ? "grid-cols-4" : grid === 3 ? "grid-cols-3" : grid === 2 ? "grid-cols-2" : "grid-cols-1"
              } gap-4`}>
                {filteredProduct
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((product) => (
                    <div key={product.id} className="flex justify-center">
                      <div className="w-full xl:p-4 p-2 border border-[#1E7773] bg-gradient-to-l from-[#403E4A] to-[#32303E] rounded-2xl group">
                        <Link href={product.is_customizeable ? `/customization/${product.slug}` : `/product/${product.slug}`}>
                          <div className="relative p-5 flex justify-center items-center">
                            <Image
                              className="w-full rounded-xl h-[200px] object-cover transition-all duration-300"
                              src={
                                hoveredProductId === product.id && product.product_image?.[1]
                                  ? `${Assets_Url}${product.product_image[1]?.image}`
                                  : product.product_image?.[0]
                                  ? `${Assets_Url}${product.product_image[0]?.image}`
                                  : `${Image_Url}defaultImage.svg`
                              }
                              alt={product.product_image?.[0]?.image_alt || product.name || "Product Image"}
                              width={500}
                              height={500}
                              onMouseEnter={() => setHoveredProductId(product.id)}
                              onMouseLeave={() => setHoveredProductId(null)}
                              onError={(e) => (e.currentTarget.src = Image_Not_Found)}
                            />
                          </div>
                        </Link>
                        <h4 className="font-semibold xl:text-lg">{product.name}</h4>
                        <p className="text-md py-3 font-semibold">
                          {product.product_variants?.length > 0 ? (
                            <>Rs {product.product_variants[0].price} - Rs {product.product_variants[product.product_variants.length - 1].price}</>
                          ) : <span>No variants</span>}
                        </p>
                        <div className="flex xl:flex-row lg:flex-col justify-center xl:gap-4 gap-1">
                          <button
                            className="p-2 bg-[#1E7773] w-full text-[13px] cursor-pointer font-bazaar rounded-lg"
                            onClick={() => handleAddCartClick(product)}
                          >
                            ADD TO CART
                          </button>
                          <Link
                            className="p-2 border border-[#1E7773] text-center w-full font-bazaar rounded-lg"
                            href={product.is_customizeable ? `/customization/${product.slug}` : `/product/${product.slug}`}
                          >
                            BUY NOW
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-10 gap-2 text-white">
                  <button
                    onClick={() => goToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 text-lg cursor-pointer transition-colors ${currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:text-white text-gray-400"}`}
                  >
                    &larr;
                  </button>
                  {getPaginationPages().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => { if (page !== "...") goToPage(page); }}
                      className={`h-10 w-10 flex items-center justify-center rounded-full transition-all duration-300 text-lg ${
                        page === "..." ? "cursor-default text-gray-500"
                        : currentPage === page ? "bg-white text-[#2a2833] font-bold"
                        : "cursor-pointer hover:bg-white/10 text-gray-400"
                      }`}
                      disabled={page === "..."}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 text-lg cursor-pointer transition-colors ${currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:text-white text-gray-400"}`}
                  >
                    &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Quantity Modal */}
      {showQtyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[300px] text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Select Quantity</h3>
            <div className="flex items-center justify-center space-x-6 mb-6">
              <button onClick={() => setQuantity((p) => Math.max(1, p - 1))} className="w-10 h-10 rounded-full bg-gray-200 cursor-pointer text-gray-800 text-2xl font-bold flex items-center justify-center hover:bg-gray-300 transition">-</button>
              <span className="text-xl text-gray-900 font-semibold">{quantity}</span>
              <button onClick={() => setQuantity((p) => p + 1)} className="w-10 h-10 rounded-full bg-gray-200 cursor-pointer text-gray-800 text-2xl font-bold flex items-center justify-center hover:bg-gray-300 transition">+</button>
            </div>
            <div className="flex justify-between gap-3">
              <button onClick={() => setShowQtyModal(false)} className="flex-1 bg-gray-300 cursor-pointer hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition">Cancel</button>
              <button onClick={confirmAddToCart} className="flex-1 bg-[#1E7773] cursor-pointer hover:bg-[#155e5b] text-white font-semibold py-2 rounded-lg transition">Add to Cart</button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={() => setIsCartModalOpen(false)}>
          <div className="fixed md:top-32 md:right-4 bg-white shadow-lg p-4 rounded-lg z-50 w-[300px]">
            <div className="flex justify-between">
              <h4 className="text-md font-bold text-black">Added to Cart</h4>
              <FiX size={24} className="text-black" onClick={() => setIsCartModalOpen(false)} />
            </div>
            <CartModal />
            <div className="flex gap-2 mt-2">
              <Link href="/shop/" className="p-1 flex justify-center border text-[#1E7773] border-[#1E7773] w-full rounded-md">CONTINUE</Link>
              <Link href="/cart/" className="p-1 flex justify-center bg-[#1E7773] text-white w-full rounded-md">CART</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
