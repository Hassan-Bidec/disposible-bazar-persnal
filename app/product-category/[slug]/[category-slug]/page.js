"use client";
import React, { useEffect, useState, use } from "react";
import CustomHeroSection from "../../../src/components/CustomHeroSection";
import PriceRange from "../../../src/components/Shop/PriceRange";
import { Assets_Url, Image_Not_Found, Image_Url } from "../../../src/const";
import { RiFilter3Line } from "react-icons/ri";
import PriceRangeMob from "../../../src/components/Shop/PriceRangeMob";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "../../../src/Utils/axios";
import { Loader } from "../../../src/components/Loader";
import { useCart } from "../../../src/Context/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartModal from "../../../src/components/cart/CartModal";
import { FiX } from "react-icons/fi";
import CustomDetailSeo from "../../../src/components/CustomDetailSeo";
import DecodeTextEditor from "../../../src/components/DecodeTextEditor";

function CategoryDetail({ params }) {
    const unwrappedParams = use(params);
    const categorySlug = unwrappedParams?.['category-slug'] || '';


    const router = useRouter();
    const searchParams = useSearchParams();
    const searchTermFromURL = searchParams?.get("q") || "";


    // -----------------------------
    // YOUR NEW STATES FOR POPUP
    // -----------------------------
    const [showQtyModal, setShowQtyModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    // -----------------------------



    const [expanded, setExpanded] = useState(false);
    const [grid, setGrid] = useState(3);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const [filteredProduct, setFilteredProduct] = useState([]);
    const [categoryDetail, setCategoryDetail] = useState([]);
    const [Category, setCategory] = useState([]);
    const [categorySeo, setCategorySeo] = useState([]);
    const [searchTerm, setSearchTerm] = useState(searchTermFromURL || "");
    const [filter, setFilter] = useState({
        price_from: 0,
        price_to: 100000,
        sort_by: 1,
        slug: categorySlug,
    });
    const [isFilter, setIsFilter] = useState(false);
    const { addToCart } = useCart();
    const [disabledButtons, setDisabledButtons] = useState({});
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.public.get('product/category');
                const categoryData = response.data.data;
                console.log('Fetched categories:', categoryData);
                setCategories(categoryData);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);


    useEffect(() => {
        window.scrollTo(0, 450);
    }, [categorySlug]);

    const handleResize = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth < 400) {
            setGrid(1);
        } else if (screenWidth < 768) {
            setGrid(2);
        } else if (screenWidth < 1024) {
            setGrid(3);
        } else {
            setGrid(3);
        }
    };
const normalizeSlug = (slug) => slug?.replace(/\/$/, "");

  const findCategoryBySlug = (categories, slug) => {
    const normalize = (s) => s?.toLowerCase().replace(/\/$/, "");
    const normSlug = normalize(slug);

    for (const cat of categories) {
      const catNormSlug = normalize(cat.slug);
      if (catNormSlug && catNormSlug === normSlug) return cat;

      if (cat.subCategories?.length) {
        const found = findCategoryBySlug(cat.subCategories, slug);
        if (found) return found;
      }
    }
    return null;
  };

console.log("User Slug:", normalizeSlug(categorySlug));
console.log("Category Slugs:", categories.map(c => normalizeSlug(c.slug)));

  const fetchData = async () => {
  console.log("🚀 fetchData CALLED");

  if (!categories.length) {
    console.log("⏳ Categories not loaded yet");
    return;
  }

  setLoading(true);
  setCurrentPage(1);

  try {
    console.log("🔹 Slug:", categorySlug);
    console.log("🔹 Search Term:", searchTerm);
    console.log("🔹 Filter:", filter);
    console.log("🔹 Total Categories:", categories);

    // 🔍 Find category (recursive)
    const cat = findCategoryBySlug(categories, categorySlug);

    console.log("✅ Matched Category:", cat);

    if (!cat) {
      console.log("❌ Category NOT FOUND for slug:", categorySlug);
      setFilteredProduct([]);
      return;
    }

    // 📦 API Params
    const params = {
      price_from: filter.price_from,
      price_to: filter.price_to > 0 ? filter.price_to : 100000,
      sort_by: filter.sort_by,
      category_id: cat.id,
      name: searchTerm,
    };

    console.log("📡 API Params:", params);

    // 🌐 API Call
    const response = await axios.public.get("search/product", { params });

    console.log("📥 FULL API Response:", response);
    console.log("📥 API Data:", response.data);
    console.log("📥 Products:", response.data?.data);
    console.log("📥 Category Info:", response.data?.category);

    // 🧠 State updates
    setCategoryDetail(response.data?.data);
    setCategory(response.data?.category);
    setCategorySeo(response.data?.category?.category_seo_metadata);
    setFilteredProduct(response.data?.data || []);

    console.log("✅ State Updated Successfully");

  } catch (error) {
    console.error("❌ API ERROR:", error);
    console.error("❌ Error Response:", error?.response);
    console.error("❌ Error Data:", error?.response?.data);
  } finally {
    setLoading(false);
    console.log("🏁 fetchData FINISHED");
  }
};

    // Update searchTerm when URL changes
    useEffect(() => {
        setSearchTerm(searchTermFromURL || "");
    }, [searchTermFromURL]);

    // Update   when slug changes
    useEffect(() => {
        setFilter((prev) => ({
            ...prev,
            slug: categorySlug,
        }));
    }, [categorySlug]);

    // Fetch data when filter/search changes
 useEffect(() => {
    if (!categories.length) return;

    const delayDebounceFn = setTimeout(() => {
        fetchData();
    }, 300);

    return () => clearTimeout(delayDebounceFn);

}, [filter, searchTerm, categorySlug, categories]); // ✅ ADD THIS
    // Set grid on resize
    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const handleFilter = (filters) => {
        setFilter({
            ...filter,
            price_from: filters.price_from || filter.price_from,
            price_to: filters.price_to || filter.price_to,
            sort_by: filters.selected || filter.sort_by,
            slug: categorySlug,
        });
    };

    const handleAddCart = (product) => {
        const product_id = product.id;
        const product_name = product.name;
        const pack_size = Number(product.product_variants[0].pack_size);
        const product_quantity = 1;
        const total_pieces = pack_size;
        const price_per_piece = Number(product.product_variants[0].price_per_piece);
        const product_total = (price_per_piece * total_pieces).toFixed(2);
        const product_img = product.product_image[0].image;
        const product_variants = product.product_variants;

        setSelectedProduct(product);
        setQuantity(1);
        setShowQtyModal(true);

        addToCart(
            product_id,
            product_name,
            product_quantity,
            pack_size,
            total_pieces,
            price_per_piece,
            product_img,
            product_total,
            product_variants,
        );
        setIsCartModalOpen(true);
    };

    //     // --------------------------------------------------
    //   // UPDATED: Add to cart now opens quantity popup
    //   // --------------------------------------------------
    //   const handleAddCart = (product) => {
    //     setSelectedProduct(product);
    //     setQuantity(1);
    //     setShowQtyModal(true);
    //   };

    // --------------------------------------------------
    // CONFIRM ADD — real add to cart here
    // --------------------------------------------------
    const confirmAddToCart = () => {
        if (!selectedProduct) return;

        const variant = selectedProduct.product_variants?.[0];
        if (!variant) return;

        addToCart(
            selectedProduct.id,
            selectedProduct.name,
            quantity,
            Number(variant.pack_size),
            Number(variant.pack_size),
            Number(variant.price_per_piece),
            selectedProduct.product_image?.[0]?.image,
            (variant.price_per_piece * variant.pack_size * quantity).toFixed(2),
            selectedProduct.product_variants
        );

        setShowQtyModal(false);
        setIsCartModalOpen(true);
    };


    return (
        <>
            <div className="py-38">
                <CustomDetailSeo
                    title={categorySeo?.meta_title}
                    des={categorySeo?.meta_description}
                    focuskey={categorySeo?.focus_keyword}
                    canonicalUrl={categorySeo?.canonical_url}
                    schema={categorySeo?.schema}
                />
                <ToastContainer autoClose={500} />
                <CustomHeroSection
                    heading={
                        Category
                            ? `${Category?.name}`
                            : "Discover Our Product Range"
                    }
                    heroImage={Category?.hero_banner_image || Category?.image || ""}
                    path="Shop"
                    path2={Category ? `${Category?.name}` : ""}
                    hideContent={true}

                />
                <div className=" lg:px-10 px-0 flex">
                    <section className="hidden lg:flex flex-col p-5 text-white hscreen lg:w-1/5">
                        <PriceRange
                            onFilter={handleFilter}
                            isCategoryShown={false}
                        />
                    </section>
                    <div>
                        <PriceRangeMob
                            onFilter={handleFilter}
                            isFilter={isFilter}
                            setIsFilter={setIsFilter}
                            isCategoryShown={false}
                        />
                    </div>
                    <section className={`{flex p-5 hscreen lg:w-4/5 w-full `}>
                        <div className="py-4 w-full flex flex-col gap2 text-white rounded-lg">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between">
                                    <p className="text-4xl font-bazaar">
                                        {Category ? `${Category?.name}` : "Shop All"}
                                    </p>
                                    <div className="">
                                        <button onClick={() => setIsFilter(true)}>
                                            <RiFilter3Line className="lg:hidden block text-4xl rounded-full p-2 bg-[#1E7773]" />
                                        </button>
                                        <div className="hidden lg:flex justify-between gap-3 items-center">
                                            <h2 className="text-lg font-bazaar">
                                                View
                                            </h2>
                                            <img
                                                onClick={() => setGrid(4)}
                                                className="cursor-pointer w-8"
                                                src={`${Image_Url}${grid === 4 ? "ShopAssets/4greenGridImg.svg" : "ShopAssets/4gridImg.svg"}`}
                                                alt=""
                                            />
                                            <img
                                                onClick={() => setGrid(3)}
                                                className="cursor-pointer w-6"
                                                src={`${Image_Url}${grid === 3 ? "ShopAssets/3greenGridImg.svg" : "ShopAssets/3gridImg.svg"}`}
                                                alt=""
                                            />
                                            <img
                                                onClick={() => setGrid(2)}
                                                className="cursor-pointer w-4"
                                                src={`${Image_Url}${grid === 2 ? "ShopAssets/2greenGridImg.svg" : "ShopAssets/2gridImg.svg"}`}
                                                alt=""
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Breadcrumbs */}
                                <p className="text-sm text-gray-400">
                                    <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / {Category?.name}
                                </p>
                            </div>
                            {/* Show loader while loading */}
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Loader />
                                </div>
                            ) : filteredProduct.length === 0 ? (
                                <div className="flex justify-center h-screen items-center py-10">
                                    <h2 className="text-4xl font-bazaar">No products found</h2>

                                </div>
                            ) : (
                                <>
                                    <div
                                        className={`py-10 grid ${grid === 4 ? "grid-cols-4" : grid === 3 ? "grid-cols-3" : grid === 2 ? "grid-cols-2" : "grid-cols-1"} gap-4 justify-center w-full`}
                                    >
                                        {filteredProduct
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map((product, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex ${grid === 2 && index % 2 === 0 ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`w-${grid === 2 ? "fit w-82 h-full" : "full"} xl:p-4 h76 p-2 flex flex-col border border-[#1E7773] bg-gradient-to-l from-[#403E4A] to-[#32303E] rounded-2xl  group`}
                                                    >
                                                        {/* <div className="flex flex-col pb-3 items-center">
                                                    <img className='w-full h-full rounded-lg' src={product.image_path ? `${Assets_Url}${product.image_path}` : `${Image_Url}defaultImage.svg`}
                                                        alt={product.name || 'Product Image'} />
                                                </div> */}
                                                        <Link
                                                            href={`/product/${product.slug}`}
                                                            className="relative p-5 flex flex-col justify-center items-center"
                                                        >
                                                            <img
                                                                className=" w-full h-[200px] block group-hover:hidden rounded-xl object-cover"
                                                                src={
                                                                    product.product_image
                                                                        ? `${Assets_Url}${product.product_image[0]?.image}`
                                                                        : `${Image_Url}defaultImage.svg`
                                                                }
                                                                alt={
                                                                    product.name ||
                                                                    "Product Image"
                                                                }
                                                                style={{
                                                                    transition:
                                                                        "opacity 0.5s ease 0.3s",
                                                                }}
                                                                loading="lazy"
                                                            />
                                                            <img className=" w-full h-[200px] hidden group-hover:block rounded-xl object-cover"
                                                                src={
                                                                    product.product_image
                                                                        ? `${Assets_Url}${product.product_image[1]?.image}`
                                                                        : `${Image_Url}defaultImage.svg`
                                                                }
                                                                alt={
                                                                    product.name ||
                                                                    "Product Image"
                                                                }
                                                                style={{
                                                                    transition:
                                                                        "opacity 0.5s ease 0.3s",
                                                                }}
                                                                loading="lazy"
                                                            />
                                                        </Link>
                                                        <h4 className="font-semibold xl:text-lg">{`${product.name}`}</h4>
                                                        {/* <p className='fontbazaar xl:text-md text-sm my-3'>
                                                    Rs {product.current_sale_price ? Number(product.current_sale_price).toFixed() : '0'}
                                                </p> */}
                                                        <p className="text-md py-3 font-semibold">
                                                            {product.product_variants &&
                                                                product.product_variants
                                                                    .length > 0 ? (
                                                                <>
                                                                    Rs{" "}
                                                                    {
                                                                        product
                                                                            .product_variants[0]
                                                                            .price
                                                                    }{" "}
                                                                    - Rs{" "}
                                                                    {
                                                                        product
                                                                            .product_variants[
                                                                            product
                                                                                .product_variants
                                                                                .length -
                                                                            1
                                                                        ].price
                                                                    }
                                                                    {/* ₨ {quantity && selectedVariantPrice && (quantity * subQuantity * selectedVariantPrice)} */}
                                                                </>
                                                            ) : (
                                                                <span>
                                                                    No variants
                                                                    available
                                                                </span>
                                                            )}
                                                        </p>
                                                        <div className="flex xl:flex-row lg:flex-col justify-center xl:gap-4 gap-1">
                                                            <button
                                                                className={`p-2 bg-[#1E7773] w-full  font-bazaar 
cursor-pointer rounded-lg`}
                                                                onClick={() =>
                                                                    handleAddCart(
                                                                        product,
                                                                    )
                                                                }
                                                                disabled={
                                                                    loading ||
                                                                    disabledButtons[
                                                                    product.id
                                                                    ]
                                                                }
                                                            >
                                                                ADD TO CART
                                                            </button>
                                                            <Link
                                                                className={`p-2 border border-[#1E7773] text-center w-full h-fit  font-bazaar rounded-lg`}
                                                                href={`/product/${product.slug}`}
                                                            >
                                                                BUY NOW
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>

                                    {filteredProduct.length > itemsPerPage && (
                                        <div className="flex justify-center items-center mt-10 gap-2 text-white">
                                            {(() => {
                                                const totalPages = Math.ceil(filteredProduct.length / itemsPerPage);
                                                let pages = [];
                                                if (totalPages <= 7) {
                                                    for (let i = 1; i <= totalPages; i++) { pages.push(i); }
                                                } else {
                                                    if (currentPage <= 4) {
                                                        pages = [1, 2, 3, 4, 5, '...', totalPages];
                                                    } else if (currentPage > totalPages - 4) {
                                                        pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                                                    } else {
                                                        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                                                    }
                                                }
                                                
                                                return pages.map((page, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            if (page !== '...') {
                                                                setCurrentPage(page);
                                                                window.scrollTo({ top: 450, behavior: "smooth" });
                                                            }
                                                        }}
                                                        className={`h-10 w-10 flex items-center justify-center rounded-full transition-all duration-300 text-lg ${
                                                            page === '...' 
                                                                ? 'cursor-default text-gray-500' 
                                                                : currentPage === page 
                                                                    ? 'bg-white text-[#2a2833] font-bold' 
                                                                    : 'cursor-pointer hover:bg-white/10 text-gray-400'
                                                        }`}
                                                        disabled={page === '...'}
                                                    >
                                                        {page}
                                                    </button>
                                                ));
                                            })()}

                                            <button 
                                                onClick={() => {
                                                    const totalPages = Math.ceil(filteredProduct.length / itemsPerPage);
                                                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                                                    window.scrollTo({ top: 450, behavior: "smooth" });
                                                }}
                                                disabled={currentPage === Math.ceil(filteredProduct.length / itemsPerPage)}
                                                className={`px-3 py-1 text-lg cursor-pointer transition-colors ${currentPage === Math.ceil(filteredProduct.length / itemsPerPage) ? 'opacity-30 cursor-not-allowed' : 'hover:text-white text-gray-400 text-gray-400'}`}
                                            >
                                                &rarr;
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                    {isCartModalOpen && (
                        <div
                            className="fixed inset-0 flex items-center justify-center z-50"
                            onClick={() => setIsCartModalOpen(false)}
                        >
                            <div className="fixed md:top-4 md:right-4 bg-white shadow-lg p-4 rounded-lg z-50 w-[300px] transition-transform duration-500">
                                <div className="flex justify-between">
                                    <h4 className="text-md font-bold text-black">
                                        Added to Cart
                                    </h4>
                                    <FiX
                                        size={24} className="text-black"
                                        onClick={() => setIsCartModalOpen(false)}
                                    />
                                </div>
                                <CartModal />
                                <div className="flex flex-row gap-2 mt-2">
                                    <Link
                                        href="/shop/"
                                        className="p-1 flex justify-center items-center pt-2 border text-[#1E7773] border-[#1E7773] w-full lg:text-[15px] font-bazaar text-xs rounded-md"
                                    >
                                        CONTINUE
                                    </Link>
                                    <Link
                                        href="/cart/"
                                        className="p-1 flex justify-center items-center pt-2 bg-[#1E7773] w-full lg:text-[15px] font-bazaar text-xs rounded-md"
                                    >
                                        CART
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {Category && (
                    <div className="flex flex-wrap justify-start gap-4 w-full p-5 items-start  md:px-24">
                        <div>
                            <img src={
                                Category?.image
                                    ? `${Assets_Url}${Category.image}`
                                    : ""
                            }
                                alt={Category?.name || "Category Image"}
                                className="w-96 h-96 object-contain rounded-lg"
                                onError={(e) => {
                                    e.currentTarget.src = Image_Not_Found; // Path to your dummy image
                                }}
                            />
                        </div>


                        <div className="mt-25 w-full md:w-1/2">
                            <h2 className="text-5xl text-white font-semibold font-poppins">
                                {Category?.name || ""}
                            </h2>
                            {/* < body={blog?.body} /> */}
                            <div
                                className={`text-white mt-6 transition-all duration-300 ${expanded ? "max-h-full overflow-visible" : "max-h-23 overflow-hidden"
                                    }`}
                            >
                                <DecodeTextEditor body={Category.note} />
                            </div>


                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="mt-2 text-white hover:text-[#8E2C62] cursor-pointer text-sm font-bold transition-colors py-2 px-4 bg-green-500 border border-green-600 rounded-md"
                            >
                                {expanded ? "Read Less" : "Read More"}
                            </button>


                        </div>
                    </div>
                )}




                {/* =======================
    QUANTITY POPUP MODAL  
======================= */}
                {showQtyModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
                        <div className="bg-white p-6 rounded-xl shadow-lg w-[300px] text-center">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                Select Quantity
                            </h3>

                            <div className="flex items-center justify-center   space-x-6 mb-6">
                                <button
                                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                    className="w-10 h-10 rounded-full bg-gray-200 cursor-pointer text-gray-800 text-2xl font-bold flex items-center justify-center hover:bg-gray-300 transition"
                                >
                                    -
                                </button>
                                <span className="text-xl text-gray-900 font-semibold">{quantity}</span>
                                <button
                                    onClick={() => setQuantity((prev) => prev + 1)}
                                    className="w-10 h-10 rounded-full bg-gray-200 cursor-pointer text-gray-800 text-2xl font-bold flex items-center justify-center hover:bg-gray-300 transition"
                                >
                                    +
                                </button>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => setShowQtyModal(false)}
                                    className="flex-1 bg-gray-300 cursor-pointer hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAddToCart}
                                    className="flex-1 bg-[#1E7773] cursor-pointer hover:bg-[#155e5b] text-white font-semibold py-2 rounded-lg transition"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                )}





            </div>
        </>

    );
}

export default CategoryDetail;