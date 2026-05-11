"use client";
import { useEffect, useState } from 'react';
import { Assets_Url, Image_Not_Found, Image_Url } from '../../const';
import Aos from 'aos';
import 'aos/dist/aos.css';
import axios from '../../Utils/axios';
import Link from 'next/link';
import { Loader } from '../Loader';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

function Blogs() {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        Aos.init({ duration: 2000, delay: 0 });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.public.get('blogs/index');
                setBlogs(response.data.data);
            } catch (error) {
                console.log('Error fetching blogs:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return <Loader />;

    // Single blog card — reused in both grid and slider
    const BlogCard = ({ data, index }) => (
        <Link
            href={`/${data.slug}`}
            key={index}
            data-aos="fade-up"
            className="flex flex-col gap-2 py-4 w-full justify-center items-start"
            aria-label={`Read ${data.title}`}
        >
            <Image
                className="rounded-2xl w-full h-[200px] md:h-[380px] object-cover"
                src={`${Assets_Url}${data.main_image}`}
                alt={data.title}
                onError={(e) => { e.currentTarget.src = Image_Not_Found; }}
                width={500}
                height={500}
            />
            <p className="my-2 text-[12px] md:text-sm text-start text-[#898989]">
                {data.category} | {new Date(data.date).toDateString()}
            </p>
            <p className="md:text-xl text-sm text-start font-semibold">{data.title}</p>
        </Link>
    );

    return (
        <div className="md:p-20 px-4 py-10 w-full text-white relative">
            <h3 data-aos='fade-right' className='md:text-6xl text-center md:text-start text-4xl font-bazaar'>
                Our Latest Blog
            </h3>

            {/* Desktop: 3-column grid */}
            <div className="hidden md:grid grid-cols-3 gap-4 md:py-10 py-5">
                {blogs.slice(0, 3).map((data, index) => (
                    <BlogCard key={index} data={data} index={index} />
                ))}
            </div>

            {/* Mobile: Swiper slider — swipe left/right */}
            <div className="md:hidden py-5">
                <Swiper
                    slidesPerView={1.2}
                    spaceBetween={16}
                    grabCursor={true}
                    modules={[Autoplay]}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    className="w-full"
                >
                    {blogs.slice(0, 6).map((data, index) => (
                        <SwiperSlide key={index}>
                            <BlogCard data={data} index={index} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div data-aos='fade-up' className="flex justify-center md:pt-10">
                <Link href='/blog/' aria-label="Read all latest blog posts">
                    <button className='font-bazaar bg-[#1E7773] text-white p-3 pt-3 rounded-lg cursor-pointer px-5 md:mt-5'>
                        READ MORE
                    </button>
                </Link>
            </div>

            <Image
                data-aos='fade-left'
                src={`${Image_Url}HomeAssets/Blogs/blogsBgImg.svg`}
                className='absolute hidden md:block top-0 right-0 w-32'
                alt="Blog Background"
                width={500}
                height={500}
            />
        </div>
    );
}

export default Blogs;
