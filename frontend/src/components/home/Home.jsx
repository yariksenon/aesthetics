import React from 'react';
import AsideBanner from './AsideBanner';
import Header from './Header';
import Section from './Section';
import Main from './Main';
import Footer from './Footer'
import { useNavigate } from 'react-router-dom';

function Home(){   
    return (
        <>
            <AsideBanner />
            <Header />
            <Section />
            <Main />
            <Footer />
        </>
    )
}

export default Home