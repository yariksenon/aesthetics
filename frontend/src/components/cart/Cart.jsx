import React from 'react';
import Aside from './AsideBanner';
import Header from './Header';
import Section from './Section';
import ProductsForm from './ProductsForm';
import Footer from './Footer';

function Cart() {
  return (
    <>
    <Aside />
    <Header />
    <Section />
      <main className="mx-[15%] mt-[2%]">
        <ProductsForm />
      </main>
    <Footer />
    </>
  );
}

export default Cart;