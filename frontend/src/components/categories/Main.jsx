import React from "react";
import Breadcrumbs from "./Breadcrumbs";
import ProductHeader from "./ProductHeader";

function Main() {
  const title = "Подходящий текст"; // Динамический текст
  const productCount = 123; // Динамическое количество товаров


  return (
    <main className="mx-[15%] mt-[2%]">
        <>
          <Breadcrumbs />
          <ProductHeader title={title} productCount={productCount} />
        </>
    </main>
  );
}

export default Main;
