import React, { useState } from 'react';
import Accordion from './Accordion'

const ProductCatalog = () => {
  return (
    <div className="flex mt-[2%]">
      <div className="w-1/5">
        <Accordion />
      </div>
      <div className="w-4/5">
        {/* <div>Форма фильтрации</div>
          
        <div>форма товаров</div> */}
      </div>
    </div>
  );
};

export default ProductCatalog;