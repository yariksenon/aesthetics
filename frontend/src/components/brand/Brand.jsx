import React from 'react'
import AsideBanner from '../home/AsideBanner'
import Header from '../home/Header'
import Section from '../home/Section'
import SellerForm from './BrandApplicationForm'
import Footer from '../home/Footer'

function Brand() {
	return (
		<>
			<AsideBanner />
			<Header />
			<Section />
			<main className='mx-[15%]'>
				<SellerForm />
			</main>
			<Footer />
		</>
	)
}

export default Brand
