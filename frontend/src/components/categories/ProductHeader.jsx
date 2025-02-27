import React from "react";

const ProductHeader = ({ title, productCount }) => {
  return (
    <section className="mt-[5%] flex items-center space-x-[1%]">
      <p className="text-xl font-medium">{title}</p>
      <p className="text-sm text-gray-400 mt-2">{productCount} товара</p>
    </section>
  );
};

export default ProductHeader;