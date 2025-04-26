// ProductCatalog.jsx
import React from 'react';
import Accordion from './Accordion';
import ProductFilters from './ProductFilters';
import ProductCard from './ProductCard';

const ProductCatalog = () => {
  return (
    <div className="flex mt-[2%]">
      <div className="w-1/5">
        <Accordion />
      </div>
      <div className="w-4/5">
        <ProductFilters />
        <ProductCard />
      </div>
    </div>
  );
};

export default ProductCatalog;