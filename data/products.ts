import { Product } from '../types/product';

// Local seed data used while remote API is unavailable.
// Images should exist under /public/img and /public/img/burger
export const products: Product[] = [
  {
    id: 'classic',
    title: 'Classic Burger',
    description: 'Pain brioché, steak de boeuf juteux, cheddar, salade, tomate, sauce maison.',
  image: '/img/burger/burger1.png',
    price: 7.9,
    available: true
  },
  {
    id: 'bbq',
    title: 'BBQ Smoky',
    description: 'Double fromage, oignons caramélisés, sauce BBQ fumée, bacon croustillant.',
  image: '/img/burger/burger2.png',
    price: 8.9,
    available: true
  },
  {
    id: 'spicy',
    title: 'Spicy Fire',
    description: 'Poulet croustillant épicé, pickles, sauce piment chipotle, cheddar.',
  image: '/img/burger/burger3.png',
    price: 8.4,
    available: true
  },
  {
    id: 'veggie',
    title: 'Green Veggie',
    description: 'Galette végétale, avocat, roquette, oignons rouges, sauce citronnée.',
  image: '/img/burger/burger4.png',
    price: 7.5,
    available: false
  },
  {
    id: 'crispy-fish',
    title: 'Crispy Fish',
    description: 'Poisson pané croustillant, sauce tartare, salade croquante, citron.',
  image: '/img/burger/burger5.png',
    price: 7.7,
    available: true
  },
  {
    id: 'mex',
    title: 'Mexican Heat',
    description: 'Guacamole, jalapeños, pico de gallo, cheddar affiné, steak boeuf.',
  image: '/img/burger/burger6.png',
    price: 8.2,
    available: true
  },
  {
    id: 'deluxe',
    title: 'Deluxe Truffle',
    description: 'Steak premium, champignons sautés, huile de truffe, comté, pousses.',
  image: '/img/burger/burger7.png',
    price: 9.9,
    available: true
  }
];
