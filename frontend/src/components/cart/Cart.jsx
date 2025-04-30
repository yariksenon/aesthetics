import React from 'react';
import AsideBanner from '../home/AsideBanner';
import Header from '../home/Header'
import Section from '../home/Section';
import ShoppingCart from './ShoppingCart';
import Footer from '../home/Footer';

function Cart() {
  return (
    <>
    <AsideBanner />
    <Header />
    <Section />
      <main className="mx-[15%] mt-[2%]">
        <ShoppingCart />
      </main>
    <Footer />
    </>
  );
}

export default Cart;