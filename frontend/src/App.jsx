import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Loading from './components/loading/Loading';
import { VALID_CATEGORIES } from './components/categories/Сategories';
import { VALID_GENDERS } from './components/gender/Gender';

const Home = lazy(() => import('./components/home/Home'));
const Cart = lazy(() => import('./components/cart/Cart'));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));
const Categories = lazy(() => import('./components/categories/Сategories'));
const WhyUs = lazy(() => import('./components/home/WhyUs'));
const NotFound = lazy(() => import('./components/notFound/NotFound'));
const SubCategory = lazy(() => import('./components/subCategory/SubCategory'));
const Product = lazy(() => import('./components/product/Product'));
const AdminUser = lazy(() => import('./components/admin/AdminUser'));
const AdminCategory = lazy(() => import('./components/admin/AdminCategory'))
const AdminSubCategory = lazy(() => import('./components/admin/AdminSubCategory'))
const Profile = lazy(() => import('./components/profile/Profile'))

function GenderRoute() {
  const { gender } = useParams();
  return VALID_GENDERS.includes(gender) ? <Home /> : <Navigate to="/404" />;
}

function CategoryRoute() {
  const { category } = useParams();
  return VALID_CATEGORIES.includes(category) ? <Categories /> : <Navigate to="/404" />;
}

export default function App() {
  const savedGender = localStorage.getItem('activeMenuItem');
  const initialGender = VALID_GENDERS.includes(savedGender) ? savedGender : 'woman';

  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to={`/${initialGender}`} />} />
          <Route path="/about" element={<WhyUs />} />
          <Route path="/cart" element={<Cart />} />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />

          <Route path="/:gender" element={<GenderRoute />} />
          <Route path="/:gender/:category" element={<CategoryRoute />} />
          <Route path="/:gender/:category/:subcategory" element={<SubCategory />} />
          <Route path="/:gender/:category/:subcategory/:productid" element={<Product />} />

          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/users" element={<AdminUser />} />
          <Route path="/admin/category" element={<AdminCategory />} />
          <Route path="/admin/subcategory" element={<AdminSubCategory />} />
          
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </Router>
  );
}