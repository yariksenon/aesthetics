import React from "react";
import Breadcrumbs from "./Breadcrumbs";
import ProductName from "./ProductName";
import ProductCatalog from "./ProductCatalog";

function Main() {
  return (
    <main className="mx-[15%] mt-[1%]">
        <Breadcrumbs />
        <ProductName />
        <ProductCatalog />
    </main>
  );
}

export default Main;
