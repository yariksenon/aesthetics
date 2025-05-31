import { Suspense } from 'react'
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
import { FavoritesProvider } from './context/FavoritesContext'

// Импортируем компоненты напрямую
import Home from './components/home/Home'
import Cart from './components/cart/Cart'
import Categories from './components/categories/Сategories'
import WhyUs from './components/home/Rules'
import NotFound from './components/notFound/NotFound'
import SubCategory from './components/subCategory/SubCategory'
import Product from './components/product/Product'
import Profile from './components/profile/Profile'
import Favorites from './components/favorites/Favorites'
import Checkout from './components/checkout/Checkout'
import MyOrder from './components/order/MyOrderList'
import Brand from './components/brand/Brand'
import Courier from './components/courier/Courier'
import About from './components/about/About'

// Админские компоненты
import AdminPanel from './components/admin/Panel'
import AdminUsers from './components/admin/Users'
import AdminUserAddress from './components/admin/UserAddress'
import AdminCategory from './components/admin/Category'
import AdminProduct from './components/admin/Products'
import AdminProductAdd from './components/admin/product/AdminProductAdd'
import AdminProductDelete from './components/admin/product/AdminProductDelete'
import AdminProductEdit from './components/admin/product/AdminProductEdit'
import AdminProductView from './components/admin/product/AdminProductView'
import AdminSubCategories from './components/admin/SubCategories'
import AdminReview from './components/admin/Review'
import AdminOrder from './components/admin/Order'
import AdminBrand from './components/admin/Brand'
import AdminNewsletter from './components/admin/Newsletter'
import AdminCourier from './components/admin/Courier'

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

// Конфигурация маршрутов
const routes = [
	{ path: '/', redirect: true },
	{ path: '/rules', component: WhyUs },
	{ path: '/cart', component: Cart },
	{ path: '/favorites', component: Favorites },
	{ path: '/404', component: NotFound },
	{ path: '/:gender', component: GenderRoute },
	{ path: '/:gender/:category', component: CategoryRoute },
	{ path: '/:gender/:category/:subcategory', component: SubCategory },
	{ path: '/product/:id', component: Product },
	{ path: '/checkout', component: Checkout },
	{ path: '/profile', component: Profile },
	{ path: '/my-order', component: MyOrder },
	{ path: '/brand', component: Brand },
	{ path: '/courier', component: Courier },
	{ path: '/about', component: About },
]

// Конфигурация админских маршрутов
const adminRoutes = [
	{ path: '/admin', component: AdminPanel, protected: true },
	{ path: '/admin/users', component: AdminUsers, protected: true },
	{ path: '/admin/user_address', component: AdminUserAddress, protected: true },
	{ path: '/admin/categories', component: AdminCategory, protected: true },
	{
		path: '/admin/subcategories',
		component: AdminSubCategories,
		protected: true,
	},
	{ path: '/admin/products', component: AdminProduct, protected: true },
	{ path: '/admin/products/add', component: AdminProductAdd, protected: true },
	{
		path: '/admin/products/edit/:id',
		component: AdminProductEdit,
		protected: true,
	},
	{
		path: '/admin/products/delete',
		component: AdminProductDelete,
		protected: true,
	},
	{
		path: '/admin/products/view',
		component: AdminProductView,
		protected: true,
	},
	{ path: '/admin/order', component: AdminOrder, protected: true },
	{ path: '/admin/wishlists', component: SubCategory, protected: true },
	{ path: '/admin/carts', component: SubCategory, protected: true },
	{ path: '/admin/review', component: AdminReview, protected: true },
	{ path: '/admin/seller_request', component: AdminBrand, protected: true },
	{
		path: '/admin/newsletter',
		component: AdminNewsletter,
		protected: true,
	},
	{
		path: '/admin/courier',
		component: AdminCourier,
		protected: true,
	},
]

export default function App() {
	const savedGender = localStorage.getItem('activeMenuItem')
	const initialGender = VALID_GENDERS.includes(savedGender)
		? savedGender
		: 'woman'

	return (
		<CartProvider>
			<FavoritesProvider>
				<Router>
					<Suspense fallback={<Loading />}>
						<Routes>
							<Route path='/' element={<Navigate to={`/${initialGender}`} />} />
							<Route path='*' element={<Navigate to='/404' />} />

							{routes.map((route, index) => (
								<Route
									key={index}
									path={route.path}
									element={
										route.redirect ? (
											<Navigate to={`/${initialGender}`} />
										) : (
											<route.component />
										)
									}
								/>
							))}

							{adminRoutes.map((route, index) => (
								<Route
									key={`admin-${index}`}
									path={route.path}
									element={
										route.protected ? (
											<ProtectedRoute>
												<route.component />
											</ProtectedRoute>
										) : (
											<route.component />
										)
									}
								/>
							))}
						</Routes>
					</Suspense>
				</Router>
			</FavoritesProvider>
		</CartProvider>
	)
}
