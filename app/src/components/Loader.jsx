"use client";
import React from 'react';
import { Image_Url } from '../const';
import Image from 'next/image';

export const Loader = () => {
    return (
        <div className="relative flex justify-center items-center min-h-screen">
            <div className="absolute animate-spin rounded-full h-[6.5rem] w-[6.5rem] border-t-4 border-b-4 border-[#1E7773]"></div>
            <Image
                src={`${Image_Url}CircleSliderAssets/circleLogo.svg`}
                width={96}
                height={96}
                className="rounded-full h-24 w-24"
                alt="Loading Logo"
            />
        </div>
    );
};
