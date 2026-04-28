"use client";
import React from 'react';
import Image from 'next/image';
import { Image_Url } from '../../const';
import { Slide } from 'react-toastify';
import './Hero.css'

function InstaFeed() {
    const Sliders = [
        {
            img: `${Image_Url}HomeAssets/InstaFeed/instaImg01.svg`,
        },
        {
            img: `${Image_Url}HomeAssets/InstaFeed/instaImg02.svg`,
        },
        {
            img: `${Image_Url}HomeAssets/InstaFeed/instaImg03.svg`,
        },
    ];

    return (
        <div className="overflow-hidden w-full py-10 pb-32 ">
            <h3 className='text-center text-white pb-10 font-bazaar md:text-6xl text-4xl'>Instagram Feed</h3>
            <div className="relative group">
                <div className="flex w-full animate-slide">
                    {Sliders.concat(Sliders).map((Slide, index) => (
                        // <div key={index} className="flex items-center mx-4">
                        <Image key={index} src={Slide.img} alt="Insta Slide" className="mx-4 w-72 h-72 md:w-96 md:h-96" width={500} height={500} />
                        // </div>
                    ))}
                </div>
            </div>
        </div>

    );
}

export default InstaFeed;
