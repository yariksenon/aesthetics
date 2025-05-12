import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Spin } from 'antd'
import Header from '../home/Header'
import AsideBanner from '../home/AsideBanner'
import Section from '../home/Section'
import ProductAbout from './ProductAbout'
import Footer from '../home/Footer'

const Product = () => {
	const { id } = useParams()
	const [product, setProduct] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				setLoading(true)
				const response = await fetch(
					`http://localhost:8080/api/v1/product/${id}`
				)

				if (!response.ok) {
					throw new Error('Товар не найден')
				}

				const data = await response.json()
				setProduct(data)
			} catch (err) {
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}

		fetchProduct()
	}, [id])

	if (loading) {
		return (
			<div>
				<AsideBanner />
				<Header />
				<Section />
				<div className='mx-[15%] flex justify-center items-center h-96'>
					<Spin size='large' />
				</div>
				<Footer />
			</div>
		)
	}

	if (error) {
		return (
			<div>
				<AsideBanner />
				<Header />
				<Section />
				<div className='mx-[15%] flex justify-center items-center h-96'>
					<h2 className='text-xl'>{error}</h2>
				</div>
				<Footer />
			</div>
		)
	}

	return (
		<div>
			<AsideBanner />
			<Header />
			<Section />
			<div className='mx-[15%]'>
				{product ? <ProductAbout product={product} /> : null}
			</div>
			<Footer />
		</div>
	)
}

export default Product
