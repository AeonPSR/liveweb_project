import { listProducts } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import { Hero } from '../components/Hero';

export default async function HomePage() {
  const products = await listProducts();
  
  return (
    <div className="space-y-10">
      <Hero />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map(p => (
          <ProductCard product={p} key={p.id} />
        ))}
      </div>
    </div>
  );
}
