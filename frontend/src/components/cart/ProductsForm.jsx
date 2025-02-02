import React from 'react';

// Компонент для кнопок управления количеством товара
const QuantityControl = () => (
  <div className="flex gap-2 items-center border border-gray-300 bg-white px-3 py-2 w-max">
    <button type="button" className="border-none outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" viewBox="0 0 121.805 121.804">
        <path d="M7.308 68.211h107.188a7.309 7.309 0 0 0 7.309-7.31 7.308 7.308 0 0 0-7.309-7.309H7.308a7.31 7.31 0 0 0 0 14.619z" data-original="#000000" />
      </svg>
    </button>
    <span className="text-gray-800 text-sm font-semibold px-3">1</span>
    <button type="button" className="border-none outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" viewBox="0 0 512 512">
        <path d="M256 509.892c-19.058 0-34.5-15.442-34.5-34.5V36.608c0-19.058 15.442-34.5 34.5-34.5s34.5 15.442 34.5 34.5v438.784c0 19.058-15.442 34.5-34.5 34.5z" data-original="#000000" />
        <path d="M475.392 290.5H36.608c-19.058 0-34.5-15.442-34.5-34.5s15.442-34.5 34.5-34.5h438.784c19.058 0 34.5 15.442 34.5 34.5s-15.442 34.5-34.5 34.5z" data-original="#000000" />
      </svg>
    </button>
  </div>
);

// Компонент для карточки товара
const ProductCard = ({ image, name, size, color, originalPrice, discountedPrice }) => (
  <div className="flex items-start max-sm:flex-col gap-4 py-4">
    <div className="w-32 h-full shrink-0">
      <img src={image} className="w-full aspect-[112/149] object-contain" alt={name} />
    </div>
    <div className="flex items-start gap-4 w-full">
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">{name}</h3>
        <div className="space-y-1">
          <h6 className="text-sm text-gray-800">Size: <strong className="ml-2">{size}</strong></h6>
          <h6 className="text-sm text-gray-800">Color: <strong className="ml-2">{color}</strong></h6>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <button type="button" className="font-semibold text-red-500 text-sm flex items-center gap-2 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 fill-current inline" viewBox="0 0 24 24">
              <path d="M19 7a1 1 0 0 0-1 1v11.191A1.92 1.92 0 0 1 15.99 21H8.01A1.92 1.92 0 0 1 6 19.191V8a1 1 0 0 0-2 0v11.191A3.918 3.918 0 0 0 8.01 23h7.98A3.918 3.918 0 0 0 20 19.191V8a1 1 0 0 0-1-1Zm1-3h-4V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2ZM10 4V3h4v1Z" data-original="#000000"></path>
              <path d="M11 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Zm4 0v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Z" data-original="#000000"></path>
            </svg>
            Remove
          </button>
          <button type="button" className="font-semibold text-pink-500 text-sm flex items-center gap-2 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 fill-current inline" viewBox="0 0 64 64">
              <path d="M45.5 4A18.53 18.53 0 0 0 32 9.86 18.5 18.5 0 0 0 0 22.5C0 40.92 29.71 59 31 59.71a2 2 0 0 0 2.06 0C34.29 59 64 40.92 64 22.5A18.52 18.52 0 0 0 45.5 4ZM32 55.64C26.83 52.34 4 36.92 4 22.5a14.5 14.5 0 0 1 26.36-8.33 2 2 0 0 0 3.27 0A14.5 14.5 0 0 1 60 22.5c0 14.41-22.83 29.83-28 33.14Z" data-original="#000000"></path>
            </svg>
            Move to wish list
          </button>
        </div>
      </div>
      <div className="ml-auto text-right">
        <QuantityControl />
        <div className="mt-6">
          <h4 className="text-base font-bold text-gray-500 mb-1"><strike className="font-medium">{originalPrice}</strike></h4>
          <h4 className="text-base font-bold text-gray-800">{discountedPrice}</h4>
        </div>
      </div>
    </div>
  </div>
);

// Основной компонент
function Section() {
  const products = [
    {
      image: 'https://readymadeui.com/images/product6.webp',
      name: 'Black T-Shirt',
      size: '7.5',
      color: 'Black',
      originalPrice: '$22.5',
      discountedPrice: '$18.5'
    },
    {
      image: 'https://readymadeui.com/images/product7.webp',
      name: 'Black T-Shirt',
      size: '7.5',
      color: 'Black',
      originalPrice: '$22.5',
      discountedPrice: '$18.5'
    }
  ];

  return (
    <div className="font-sans">
      <div className="grid lg:grid-cols-3 gap-10 p-4">
        <div className="lg:col-span-2 bg-white divide-y">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>

        <div className="shadow-md p-6 lg:sticky lg:top-0 h-max">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-4">Order Summary</h3>
          <ul className="text-gray-800 divide-y mt-4">
            <li className="flex flex-wrap gap-4 text-sm py-3">Subtotal <span className="ml-auto font-bold">$73.00</span></li>
            <li className="flex flex-wrap gap-4 text-sm py-3">Shipping <span className="ml-auto font-bold">$4.00</span></li>
            <li className="flex flex-wrap gap-4 text-sm py-3">Tax <span className="ml-auto font-bold">$4.00</span></li>
            <li className="flex flex-wrap gap-4 text-sm py-3 font-bold">Total <span className="ml-auto">$81.00</span></li>
          </ul>
          <button type="button" className="mt-4 text-sm px-4 py-2.5 w-full bg-black hover:bg-gray-800 text-white tracking-wide">Make Payment</button>
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Apply promo code</h3>
            <div className="flex border border-black overflow-hidden max-w-md">
              <input type="email" placeholder="Promo code" className="w-full outline-none bg-white text-gray-600 text-sm px-4 py-2.5" />
              <button type='button' className="flex items-center justify-center bg-black hover:bg-gray-800 px-5 text-sm text-white">Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section;