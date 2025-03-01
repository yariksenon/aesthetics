import React from "react";
import Breadcrumbs from "./Breadcrumbs";
import ProductHeader from "./ProductHeader";
import ProductCatalog from "./ProductCatalog";

function Main() {
  const title = "Подходящий текст"; // Динамический текст
  const productCount = 123; // Динамическое количество товаров


  return (
    <main className="mx-[15%] mt-[1%]">
        <Breadcrumbs />
        <ProductHeader title={title} productCount={productCount} />
        <ProductCatalog />
    </main>
  );
}

export default Main;
