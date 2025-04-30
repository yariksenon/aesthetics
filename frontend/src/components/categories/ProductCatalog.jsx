import React, { useState } from 'react';
import Accordion from './Accordion';
import ProductFilters from './ProductFilters';
import ListProduct from './ListProduct';

const ProductCatalog = () => {
  const [appliedFilters, setAppliedFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    setAppliedFilters(newFilters);
  };

  return (
    <div className="flex mt-[2%]">
      <div className="w-1/5">
        <Accordion />
      </div>
      <div className="w-4/5">
        <ProductFilters onFilter={handleFilterChange} />
        <ListProduct filters={appliedFilters} />
      </div>
    </div>
  );
};

export default ProductCatalog;