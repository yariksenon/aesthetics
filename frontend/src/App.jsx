import { lazy, Suspense } from 'react'
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	useParams,
} from 'react-router-dom'
import Loading from './components/loading/Loading'
import { VALID_CATEGORIES } from './components/categories/Сategories'
import { VALID_GENDERS } from './components/gender/Gender'
import ProtectedRoute from './components/admin/ProtectedRoute'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext' // Добавлен провайдер избранного

const Home = lazy(() => import('./components/home/Home'))
const Cart = lazy(() => import('./components/cart/Cart'))
const Categories = lazy(() => import('./components/categories/Сategories'))
const WhyUs = lazy(() => import('./components/home/WhyUs'))
const NotFound = lazy(() => import('./components/notFound/NotFound'))
const SubCategory = lazy(() => import('./components/subCategory/SubCategory'))
const Product = lazy(() => import('./components/product/Product'))
const Profile = lazy(() => import('./components/profile/Profile'))
const Favorites = lazy(() => import('./components/favorites/Favorites')) // Новый компонент избранного
const AdminUsers = lazy(() => import('./components/admin/Users'))
const AdminUserAddress = lazy(() => import('./components/admin/UserAddress'))

const AdminCategory = lazy(() => import('./components/admin/Category'))
const AdminPanel = lazy(() => import('./components/admin/Panel'))
const AdminProduct = lazy(() => import('./components/admin/Products'))
const AdminProductAdd = lazy(() =>
	import('./components/admin/product/AdminProductAdd')
)
const AdminProductDelete = lazy(() =>
	import('./components/admin/product/AdminProductDelete')
)
const AdminProductEdit = lazy(() =>
	import('./components/admin/product/AdminProductEdit')
)
const AdminProductView = lazy(() =>
	import('./components/admin/product/AdminProductView')
)
const AdminSubCategories = lazy(() =>
	import('./components/admin/SubCategories')
)
const Order = lazy(() => import('./components/order/Order'))
const SearchResults = lazy(() => import('./components/search/SearchResults'))

function GenderRoute() {
	const { gender } = useParams()
	return VALID_GENDERS.includes(gender) ? <Home /> : <Navigate to='/404' />
}

function CategoryRoute() {
	const { category } = useParams()
	return VALID_CATEGORIES.includes(category) ? (
		<Categories />
	) : (
		<Navigate to='/404' />
	)
}

export default function App() {
	const savedGender = localStorage.getItem('activeMenuItem')
	const initialGender = VALID_GENDERS.includes(savedGender)
		? savedGender
		: 'woman'

	return (
		<CartProvider>
			<FavoritesProvider>
				{' '}
				{/* Добавлен провайдер избранного */}
				<Router>
					<Suspense fallback={<Loading />}>
						<Routes>
							<Route path='/' element={<Navigate to={`/${initialGender}`} />} />
							<Route path='/about' element={<WhyUs />} />
							<Route path='/cart' element={<Cart />} />
							<Route path='/favorites' element={<Favorites />} />{' '}
							{/* Новый маршрут для избранного */}
							<Route path='/404' element={<NotFound />} />
							<Route path='*' element={<Navigate to='/404' />} />
							<Route path='/:gender' element={<GenderRoute />} />
							<Route path='/:gender/:category' element={<CategoryRoute />} />
							<Route
								path='/:gender/:category/:subcategory'
								element={<SubCategory />}
							/>
							<Route
								path='/:gender/:category/:subcategory/:productid'
								element={<Product />}
							/>
							<Route path='/product/:productid' element={<Product />} />
							<Route path='/order' element={<Order />} />
							<Route path='/:gender/search' element={<SearchResults />} />
							<Route
								path='/admin'
								element={
									<ProtectedRoute>
										<AdminPanel />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/users'
								element={
									<ProtectedRoute>
										<AdminUsers />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/user_address'
								element={
									<ProtectedRoute>
										<AdminUserAddress />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/categories'
								element={
									<ProtectedRoute>
										<AdminCategory />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/subcategories'
								element={
									<ProtectedRoute>
										<AdminSubCategories />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/products'
								element={
									<ProtectedRoute>
										<AdminProduct />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/products/add'
								element={
									<ProtectedRoute>
										<AdminProductAdd />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/products/edit'
								element={
									<ProtectedRoute>
										<AdminProductEdit />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/products/delete'
								element={
									<ProtectedRoute>
										<AdminProductDelete />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/products/view'
								element={
									<ProtectedRoute>
										<AdminProductView />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/orders'
								element={
									<ProtectedRoute>
										<SubCategory />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/payments'
								element={
									<ProtectedRoute>
										<SubCategory />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/wishlists'
								element={
									<ProtectedRoute>
										<SubCategory />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/carts'
								element={
									<ProtectedRoute>
										<SubCategory />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/admin/statistics'
								element={
									<ProtectedRoute>
										<SubCategory />
									</ProtectedRoute>
								}
							/>
							<Route path='/profile' element={<Profile />} />
						</Routes>
					</Suspense>
				</Router>
			</FavoritesProvider>
		</CartProvider>
	)
}
