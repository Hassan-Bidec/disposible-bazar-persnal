"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import { Autoplay } from 'swiper/modules';
import { Profile_Assets_Url } from '../../const';
import axios from '../../Utils/axios';
import { PiStarFill } from 'react-icons/pi';

const FALLBACK_AVATAR = `https://static.vecteezy.com/system/resources/previews/018/765/757/original/user-profile-icon-in-flat-style-member-avatar-illustration-on-isolated-background-human-permission-sign-business-concept-vector.jpg`;

const ReviewSlider = ({ initialReviews = [] }) => {
  const [reviews, setReviews] = useState(initialReviews);

  useEffect(() => {
    if (initialReviews.length > 0) return;
    const fetchData = async () => {
      try {
        const response = await axios.public.get('all_reviews');
        setReviews(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="py-8 px-4 text-white">
      <Swiper
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        breakpoints={{
          100: { slidesPerView: 1 },
          480: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        spaceBetween={16}
        modules={[Autoplay]}
        className="mySwiper"
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            <div
              className={`${index % 2 === 0 ? 'mb-8' : 'mt-8'} flex flex-col rounded-2xl overflow-hidden bg-[#1a1a1a] mx-2`}
            >
              {/* Review Image */}
              <div className="relative w-full h-[200px] bg-[#2a2a2a]">
                {review.image ? (
                  <Image
                    src={`${Profile_Assets_Url}/${review.image}`}
                    alt={review.name || 'Review image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                    No Image
                  </div>
                )}
              </div>

              {/* Profile + Info */}
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={review.user?.photo ? `${Profile_Assets_Url}/${review.user.photo}` : FALLBACK_AVATAR}
                      alt={review.name || 'User'}
                      width={10}
                      height={10}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold truncate">{review.name}</h2>
                    <div className="flex gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <PiStarFill
                          key={i}
                          size="0.75rem"
                          className={i < review.rating ? 'text-yellow-400' : 'text-gray-600'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.description && (
                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                    {review.description}
                  </p>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ReviewSlider;
