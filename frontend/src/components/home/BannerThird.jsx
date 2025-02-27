import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BannerThree from "../../assets/home/BannerThird/bannerThird.svg";

const banner = { alt: "Brand", category: "brand" };

function BannerThird() {
    const { gender } = useParams();
    const navigate = useNavigate();

    const handleClick = useCallback((category) => {
        navigate(`/${gender}/${category}`);
    }, [navigate, gender]);

    return (
        <div className="mt-[2%]">
            <button
                aria-label={`Перейти к разделу ${banner.alt}`}
                onClick={() => handleClick(banner.category)}
                className="focus:outline-none"
            >
                <img
                    src={BannerThree}
                    alt={banner.alt}
                    className="duration-500 hover:opacity-75"
                />
            </button>
        </div>
    );
}

export default BannerThird;