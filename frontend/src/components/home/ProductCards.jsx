import firstProduct from '../../assets/home/ProductCards/ProductCards-1.svg';
import secondProduct from '../../assets/home/ProductCards/ProductCards-2.svg';
import thirdProduct from '../../assets/home/ProductCards/ProductCards-3.svg';
import fourthProduct from '../../assets/home/ProductCards/ProductCards-4.svg';
import fifthProduct from '../../assets/home/ProductCards/ProductCards-5.svg';
import sixthProduct from '../../assets/home/ProductCards/ProductCards-6.svg';

const products = [
  {
    id: 1,
    name: 'Classic Tee',
    brand: 'Nike',
    href: '#',
    imageSrc: firstProduct,
    imageAlt: "Front of men's Classic Tee in black.",
    originalPrice: '275.99',
    discountedPrice: '234.6',
    discountPercentage: '-15%',
  },
  {
    id: 2,
    name: 'Sport Hoodie',
    brand: 'Adidas',
    href: '#',
    imageSrc: secondProduct,
    imageAlt: "Front of men's Sport Hoodie in gray.",
    originalPrice: '350.00',
    discountedPrice: '280.00',
    discountPercentage: '-20%',
  },
  {
    id: 3,
    name: 'Casual Shirt',
    brand: 'Puma',
    href: '#',
    imageSrc: thirdProduct,
    imageAlt: "Front of men's Casual Shirt in blue.",
    originalPrice: '200.00',
    discountedPrice: null,
    discountPercentage: null,
  },
  {
    id: 4,
    name: 'Running Shoes',
    brand: 'Reebok',
    href: '#',
    imageSrc: fourthProduct,
    imageAlt: "Pair of Running Shoes in white.",
    originalPrice: '120.00',
    discountedPrice: '100.00',
    discountPercentage: '-17%',
  },
  {
    id: 5,
    name: 'Winter Jacket',
    brand: 'TNF',
    href: '#',
    imageSrc: fifthProduct,
    imageAlt: "Front of men's Winter Jacket in green.",
    originalPrice: '450.00',
    discountedPrice: '400.00',
    discountPercentage: '-11%',
  },
  {
    id: 6,
    name: 'Denim Jeans',
    brand: 'Levi\'s',
    href: '#',
    imageSrc: sixthProduct,
    imageAlt: "Front of men's Denim Jeans in blue.",
    originalPrice: '90.00',
    discountedPrice: null,
    discountPercentage: null,
  },
];


function productCarts() {
  return (
    <>
      <div className="mt-[10%] lg:mt[8%] xl:mt-[5%]">
        <div className="grid grid-cols-6 gap-2 overflow-hidden" style={{ maxWidth: '100%' }}>
          {products.slice(0, 6).map((product) => (
            <div
              key={product.id}
              className="relative group overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Блок с изображением */}
              <div className='relative overflow-hidden'>
                <img
                  alt={product.imageAlt}
                  src={product.imageSrc}
                  className="w-full object-cover transition-transform duration-300 transform group-hover:scale-110"
                />

                {/* Блок скидки */}
                {product.discountPercentage && (
                  <div className="absolute bottom-0 left-0 bg-red-600 px-1 text-white text-[5px] sm:text-xs sm:px-2 md:text-sm lg:text-base lg:px-3">
                    {product.discountPercentage}
                  </div>
                )}

                {/* Затемнение при наведении */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
              </div>

              {/* Блок с ценой и названием */}
              <div className='flex justify-between mt-[3%] space-x-0'>
                {product.discountedPrice ? (
                  <>
                    <p className='line-through text-gray-500 text-[6px] xs:text-[8px] sm:text-[9px] md:text-[10px] lg:text-[15px] xl:text-[18px]'>
                      {product.originalPrice}
                    </p>
                    <p className='text-red-600 font-semibold text-[6px] xs:text-[8px] sm:text-[9px] md:text-[10px] lg:text-[15px] xl:text-[18px]'>
                      {product.discountedPrice} р.
                    </p>
                  </>
                ) : (
                  <p className='text-gray-900 font-semibold text-[6px] xs:text-[8px] sm:text-[9px] md:text-[10px] lg:textp-[15px] xl:text-[18px]'>
                    {product.originalPrice} р.
                  </p>
                )}
              </div>

              <div className='mt-1 space-y-1'>
                <p className='text-[5px] xs:text-[7px] sm:text-[8px] md:text-[9px] lg:text-[13px] xl:text-[15px] cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-300'>
                  {product.brand}
                </p>
                <p className='text-[6px] xs:text-[8px] sm:text-[9px] md:text-[10px] lg:text[15px] xl:text-[18px] cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-300'>
                  {product.name}
                </p>
              </div>

              {/* Кнопка "Купить" (появляется при наведении) */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden 2xl:block">
                <button className="bg-black text-white px-3 py-1 text-xs sm:text-sm rounded-full hover:bg-gray-800 transition-colors duration-300">
                  Купить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default productCarts;