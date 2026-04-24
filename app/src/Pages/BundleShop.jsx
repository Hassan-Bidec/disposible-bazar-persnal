"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CustomHeroSection from "../components/CustomHeroSection";
import { Assets_Url, Image_Not_Found, Image_Url } from "../const";
import axios from "../Utils/axios";
import { Loader } from "../components/Loader";
import CustomSeo from "../components/CustomSeo";
import Link from "next/link";

function BundleShop() {
  const router = useRouter();
  const params = useParams();

  const [grid, setGrid] = useState(3);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [filteredProduct, setFilteredProduct] = useState([]);
  const [seoData, setSeoData] = useState({
    meta_title: "",
    focus_keyword: "",
    canonical_url: "",
    schema: "",
  });

  // Navigate to a new page — ?product-page=2 format, no remount
  const updatePageQuery = (newPage) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(window.location.search);
    if (newPage <= 1) {
      params.delete("product-page");
    } else {
      params.set("product-page", String(newPage));
    }
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    window.scrollTo({ top: 450, behavior: "smooth" });
  };

  // Sync currentPage when URL changes (e.g. browser back/forward)
  useEffect(() => {
    const page = new URLSearchParams(window.location.search).get("product-page");
    setCurrentPage(page ? parseInt(page) : 1);
  }, []);

  const handleResize = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 400) setGrid(1);
    else if (screenWidth < 768) setGrid(2);
    else if (screenWidth < 1024) setGrid(3);
    else setGrid(3);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const response = await axios.public.get(`bundles`);
      const data = response.data.data;
      setFilteredProduct(data);
      console.log("Filtered Product:", data);

      // Extract SEO fields from the first bundle item if available
      if (data?.length > 0) {
        const { meta_title, focus_keyword, canonical_url, schema } = data[0];
        setSeoData({ meta_title, focus_keyword, canonical_url, schema });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 450, behavior: "smooth" });
  }, [currentPage]);

  const handleLoadMore = () => {
    // setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="py-13">
      <CustomSeo data={seoData} />
      <CustomHeroSection
        heading="Ready Bundles"
        path="bundles"
        bgImage="CustomHeroAssets/bundlesbanner.png"
        hideContent={true}
      />

      <div className="lg:px-10 px-0 flex">
        <section className="flex p-5 hscreen lg:w-full w-full">
          <div className="py-4 w-full flex flex-col gap2 text-white rounded-lg">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <h4 className="text-4xl font-bazaar">Bundles</h4>
                <div className="hidden lg:flex justify-between gap-3 items-center">
                  <h4 className="text-md font-bazaar">View</h4>
                  <img
                    onClick={() => setGrid(4)}
                    className="cursor-pointer"
                    src={`${Image_Url}${
                      grid === 4 ? "ShopAssets/4greenGridImg.svg" : "ShopAssets/4gridImg.svg"
                    }`}
                    alt=""
                  />
                  <img
                    onClick={() => setGrid(3)}
                    className="cursor-pointer"
                    src={`${Image_Url}${
                      grid === 3 ? "ShopAssets/3greenGridImg.svg" : "ShopAssets/3gridImg.svg"
                    }`}
                    alt=""
                  />
                  <img
                    onClick={() => setGrid(2)}
                    className="cursor-pointer"
                    src={`${Image_Url}${
                      grid === 2 ? "ShopAssets/2greenGridImg.svg" : "ShopAssets/2gridImg.svg"
                    }`}
                    alt=""
                  />
                </div>
              </div>
              {/* Breadcrumbs */}
              <p className="text-sm text-gray-400">
                <Link href="/">Home</Link> / Bundles
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader />
              </div>
            ) : filteredProduct?.length === 0 ? (
              <div className="flex justify-center h-screen items-center py-10">
                <h2 className="text-4xl font-bazaar">No products found</h2>
              </div>
            ) : (
              <>
                <div
                  className={`py-10 grid ${
                    grid === 4
                      ? "grid-cols-4"
                      : grid === 3
                      ? "grid-cols-3"
                      : grid === 2
                      ? "grid-cols-2"
                      : "grid-cols-1"
                  } gap-4 justify-center w-full`}
                >
                  {filteredProduct?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product, index) => (
                    <div
                      key={index}
                      onClick={() => router.push(`/bundle/${product.slug}`)}
                      className="cursor-pointer"
                    >
                      <div className={`flex ${grid === 2 && index % 2 === 0 ? "justify-end" : "justify-start"}`}>
                        <div className={`w-${grid === 2 ? "fit w-82 h-full" : "full"} xl:p-4 h76 p-2 flex flex-col border border-[#1E7773] bg-[#32303e] rounded-2xl group`}>
                          <div className="relative p-5 flex flex-col justify-center items-center max">
                            <img
                              className="w-full h-[243px] block rounded-xl object-cover"
                              src={product.main_image ? `${Assets_Url}${product.main_image}` : `${Image_Url}defaultImage.svg`}
                              alt={product.name || "Product Image"}
                              style={{ transition: "opacity 0.5s ease 0.3s" }}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = Image_Not_Found;
                              }}
                            />
                          </div>
                          <h4 className="font-semibold xl:text-lg h-10">{product.name}</h4>
                          <p className="text-md py-3 font-semibold">Rs {Number(product.payable_amount)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
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
                              updatePageQuery(page);
                            }
                          }}
                          className={`h-10 w-10 flex items-center justify-center rounded-full transition-all duration-300 text-lg ${page === '...'
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
                        updatePageQuery(Math.min(totalPages, currentPage + 1));
                      }}
                      disabled={currentPage === Math.ceil(filteredProduct.length / itemsPerPage)}
                      className={`px-3 py-1 text-lg cursor-pointer transition-colors ${currentPage === Math.ceil(filteredProduct.length / itemsPerPage) ? 'opacity-30 cursor-not-allowed' : 'hover:text-white text-gray-400'}`}
                    >
                      &rarr;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default BundleShop;
