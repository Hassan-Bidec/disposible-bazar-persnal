"use client";

import { useState, useEffect } from "react";
import { RiFilter3Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import BlogSlider from "../src/components/BlogSlider";
import BlogBody from "../src/components/BlogBody";
import axios from "../src/Utils/axios";

// Receives blog + recommendedBlogs from Server Component
export default function BlogDetailClient({ blog, recommendedBlogs }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.public.get("product/category");
        setCategories(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategories();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="w-full mt-16 overflow-x-hidden">
      <div className="lg:hidden flex justify-end p-4">
        <button
          onClick={toggleSidebar}
          className="text-white text-xl flex justify-center items-center bg-[#1E7773] p-2 rounded-full"
        >
          <RiFilter3Line />
        </button>
      </div>

      <div className="flex gap-0">
        {/* Sidebar */}
        <div className="md:ml-10 ml-0 w-full md:w-72 flex-shrink-0">
          <BlogSidebar
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            categories={categories}
          />
        </div>

        {/* Blog body */}
        <div className="text-white p-10 flex-1 min-w-0">
          {blog ? (
            <BlogBody body={blog.body} />
          ) : (
            <p>No blog content available.</p>
          )}
        </div>
      </div>

      {recommendedBlogs?.length > 0 && (
        <BlogSlider blogsCategories={recommendedBlogs} />
      )}
    </div>
  );
}

function BlogSidebar({ toggleSidebar, isSidebarOpen, categories }) {
  return (
    <div>
      <div
        className={`fixed lg:static lg:block top-0 left-0 min-h-screen md:h-auto overflow-y-auto bg-[#33333F] text-white p-4 lg:rounded-lg transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-72`}
      >
        <div className="lg:hidden flex justify-end mb-4">
          <button onClick={toggleSidebar} className="text-white text-xl p-2">
            <RxCross2 />
          </button>
        </div>

        <div className="mb-6 p-4 bg-[#33333F] rounded-lg w-full">
          <h2 className="text-lg font-semibold mb-4">CATEGORIES</h2>
          <ul className="h-auto overflow-y-auto max-h-96">
            {categories.map((category) => (
              <li
                key={category.id}
                className="text-base hover:text-gray-400 cursor-pointer border-b border-gray-500 py-4"
                onClick={toggleSidebar}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6 p-4 rounded-lg w-full">
          <h3 className="font-bazaar text-xl text-white mb-4">SHARE ARTICLE</h3>
          <ul className="flex flex-row gap-4">
            <li className="text-white p-2 rounded-full hover:bg-[#1E7773]">
              <a aria-label="Facebook" href="https://www.facebook.com/DisposableBazar/">
                <FaFacebookF />
              </a>
            </li>
            <li className="text-white p-2 rounded-full hover:bg-[#1E7773]">
              <a aria-label="Instagram" href="https://www.instagram.com/disposablebazaar/">
                <FaInstagram />
              </a>
            </li>
            <li className="text-white p-2 rounded-full hover:bg-[#1E7773]">
              <a aria-label="Tiktok" href="https://www.tiktok.com/@disposablebazaar">
                <FaTiktok />
              </a>
            </li>
            <li className="text-white p-2 rounded-full hover:bg-[#1E7773]">
              <a aria-label="Youtube" href="https://www.youtube.com/@disposablebazaar">
                <FaYoutube />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed top-0 left-0 w-full h-full z-40 lg:hidden"
        />
      )}
    </div>
  );
}
