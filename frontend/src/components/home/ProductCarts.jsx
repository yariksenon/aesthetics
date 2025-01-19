const products = [
  {
    id: 1,
    name: 'Basic Tee',
    brand: 'Nike',
    href: '#',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
    originalPrice: '275.99',
    discountedPrice: '234.6',
    discountPercentage: '-15%',
  },
  {
    id: 2,
    name: 'Basic Tee',
    brand: 'Nike',
    href: '#',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
    originalPrice: '275.99',
    discountedPrice: '234.6',
    discountPercentage: '-15%',
  },
  {
    id: 3,
    name: 'Basic Tee',
    brand: 'Nike',
    href: '#',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
    originalPrice: '275.99',
    discountedPrice: null,
    discountPercentage: null,
  },
  {
    id: 4,
    name: 'Basic Tee',
    brand: 'Nike',
    href: '#',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
    originalPrice: '275.99',
    discountedPrice: null,
    discountPercentage: null,
  },
  {
    id: 5,
    name: 'Basic Tee',
    brand: 'Nike',
    href: '#',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
    originalPrice: '275.99',
    discountedPrice: null,
    discountPercentage: null,
  },
  {
    id: 6,
    name: 'Basic Tee',
    brand: 'Nike',
    href: '#',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
    originalPrice: '275.99',
    discountedPrice: null,
    discountPercentage: null,
  },
  
];


function productCarts(){
    return(
        <>
          <div className="mt-[5%]">
            <div className="grid grid-cols-6 gap-2 overflow-hidden" style={{ maxWidth: '100%' }}>
              {products.slice(0, 6).map((product) => (
                
                
                
                <div key={product.id} className="relative">
                  <div className='relative'>
                  <img
                    alt={product.imageAlt}
                    src={product.imageSrc}
                    className="w-full object-cover relative transition-transform transform hover:scale-105 hover:shadow-lg hover:opacity-90"
                  />

                    {product.discountPercentage && ( 
                      <div className="absolute bottom-0 left-0  bg-red-600 px-1 text-white text-[5px] sm:text-xs sm:px-2 md:text-sm lg:text-base lg:px-3"> 
                      {product.discountPercentage} 
                      </div> 
                  )}
                  </div>
                  <div className='flex justify-between mt-[3%] text-[10px] sm:text-xs md:text-sm lg:text-base'>
                    {product.discountedPrice ? (
                     <>
                      <p className='line-through'>{product.originalPrice} </p> 
                      <p className='text-red-600'>{product.discountedPrice} р.</p>
                     </>
                    ) : (
                      <p>{product.originalPrice} р.</p>
                      )}
                    </div>
                      <p className='text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>{product.brand}</p>
                      <p className='text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>{product.name}</p>
                </div>
              ))}
            </div>
          </div>
        </>
    )
}


export default productCarts;