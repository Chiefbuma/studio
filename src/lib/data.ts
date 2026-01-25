
import type { Cake, SpecialOffer, CustomizationOptions, Order } from './types';

export const cakes: Cake[] = [
  {
    id: 'red-velvet-delight',
    name: 'Red Velvet Delight',
    description: 'A classic Southern dessert, this cake boasts a moist, velvety crumb with a hint of cocoa, layered with rich cream cheese frosting.',
    base_price: 3200,
    image_id: 'red-velvet-delight',
    rating: 4.8,
    category: 'Classic',
    orders_count: 152,
    ready_time: '24h',
    defaultFlavorId: 'f4', // Red Velvet
    customizable: true,
  },
  {
    id: 'strawberry-dream',
    name: 'Strawberry Dream',
    description: 'Light vanilla sponge cake filled with fresh strawberries and whipped cream. Comes as an 8" Round cake with our Fresh Strawberry flavor.',
    base_price: 3000,
    image_id: 'strawberry-dream',
    rating: 4.7,
    category: 'Fruit',
    orders_count: 120,
    ready_time: '24h',
    defaultFlavorId: 'f5', // Strawberry
    customizable: false,
  },
    {
    id: 'chocolate-fudge-bliss',
    name: 'Chocolate Fudge Bliss',
    description: 'A chocoholic\'s dream. Decadent layers of rich chocolate fudge cake and creamy chocolate ganache. Pure bliss.',
    base_price: 3500,
    image_id: 'special-offer-cake', // Re-using special offer image for this
    rating: 4.9,
    category: 'Chocolate',
    orders_count: 210,
    ready_time: '48h',
    defaultFlavorId: 'f2', // Rich Chocolate
    customizable: true,
  },
  {
    id: 'lemon-zest-creation',
    name: 'Lemon Zest Creation',
    description: 'A zesty and tangy lemon cake made with fresh lemon juice and zest, topped with a sweet lemon glaze. Comes as a 6" Round cake with our Zesty Lemon flavor.',
    base_price: 2800,
    image_id: 'lemon-zest-creation',
    rating: 4.6,
    category: 'Citrus',
    orders_count: 98,
    ready_time: '24h',
    defaultFlavorId: 'f3', // Zesty Lemon
    customizable: false,
  },
  {
    id: 'vanilla-bean-classic',
    name: 'Vanilla Bean Classic',
    description: 'Timeless and elegant. A moist vanilla bean cake with a silky smooth vanilla buttercream frosting. Simply perfect.',
    base_price: 2500,
    image_id: 'vanilla-bean-classic',
    rating: 4.5,
    category: 'Classic',
    orders_count: 180,
    ready_time: '24h',
    defaultFlavorId: 'f1', // Classic Vanilla
    customizable: true,
  },
  {
    id: 'matcha-elegance',
    name: 'Matcha Elegance',
    description: 'A sophisticated cake featuring premium matcha green tea, balanced with a light and airy white chocolate mousse.',
    base_price: 3800,
    image_id: 'matcha-elegance',
    rating: 4.8,
    category: 'Exotic',
    orders_count: 75,
    ready_time: '48h',
    defaultFlavorId: 'f6', // Matcha
    customizable: true,
  },
];

export const specialOffer: SpecialOffer = {
  cake: {
    id: 'special-offer-cake',
    name: 'Caramel Drizzle Dream',
    description: 'A decadent chocolate cake layered with silky salted caramel buttercream, topped with a rich caramel drizzle. Comes as an 8" Round cake and cannot be customized.',
    base_price: 4000,
    image_id: 'special-offer-cake',
    rating: 4.9,
    category: 'Signature',
    orders_count: 88,
    ready_time: '48h',
    defaultFlavorId: 'f7',
    customizable: false,
  },
  discount_percentage: 20,
  original_price: 4000,
  special_price: 3200,
  savings: 800,
};

export const customCake: Cake = {
  id: 'custom-cake',
  name: 'Custom Creation',
  description: 'Design your own cake from scratch. Choose your flavor, size, colors, and toppings to create your perfect dessert.',
  base_price: 1200,
  image_id: 'custom-cake-placeholder',
  rating: 0,
  category: 'Custom',
  orders_count: 0,
  ready_time: '48h+',
  customizable: true,
};

export const orders: Order[] = [
  {
    id: 1,
    order_number: 'WD-12345',
    customer_name: 'John Doe',
    customer_phone: '0712345678',
    delivery_method: 'delivery',
    delivery_address: 'Vision Tower, Muthithi Road, Nairobi, Kenya',
    latitude: -1.272159,
    longitude: 36.812329,
    total_price: 3200,
    deposit_amount: 2560,
    payment_status: 'paid',
    order_status: 'processing',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'special-offer-cake-1',
        cakeId: 'special-offer-cake',
        name: 'Caramel Drizzle Dream',
        quantity: 1,
        price: 3200,
        image_id: 'special-offer-cake',
      },
    ],
  },
  {
    id: 2,
    order_number: 'WD-67890',
    customer_name: 'Jane Smith',
    customer_phone: '0787654321',
    delivery_method: 'pickup',
    pickup_location: 'Westlands Branch',
    total_price: 5300,
    deposit_amount: 4240,
    payment_status: 'paid',
    order_status: 'complete',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
       {
        id: 'custom-1662733487299',
        cakeId: 'custom-cake',
        name: 'Custom Creation',
        quantity: 1,
        price: 5300,
        image_id: 'custom-cake-placeholder',
        customizations: {
          flavor: 'f2', // Rich Chocolate
          size: 's3', // 10" Round
          color: 'c2', // Pastel Pink
          toppings: ['t1', 't2'], // Fresh Berries, Chocolate Drip
        },
      },
    ],
  },
    {
    id: 3,
    order_number: 'WD-11223',
    customer_name: 'Peter Jones',
    customer_phone: '0711223344',
    delivery_method: 'delivery',
    delivery_address: '123 Gitanga Rd, Nairobi, Kenya',
    latitude: -1.29173,
    longitude: 36.7821,
    total_price: 6650,
    deposit_amount: 5320,
    payment_status: 'paid',
    order_status: 'processing',
    created_at: new Date().toISOString(),
    items: [
      {
        id: 'red-velvet-delight-1',
        cakeId: 'red-velvet-delight',
        name: 'Red Velvet Delight',
        quantity: 1,
        price: 4350,
        image_id: 'red-velvet-delight',
        customizations: {
          flavor: 'f4', // Red Velvet (locked)
          size: 's2', // 8" Round
          color: 'c1', // Classic White
          toppings: ['t2'], // Chocolate Drip
        }
      },
       {
        id: 'vanilla-bean-classic-1',
        cakeId: 'vanilla-bean-classic',
        name: 'Vanilla Bean Classic',
        quantity: 1,
        price: 2300,
        image_id: 'vanilla-bean-classic',
      },
    ],
  },
];

export const customizationOptions: CustomizationOptions = {
  flavors: [
    { id: 'f1', name: 'Classic Vanilla', price: 0, color: '#f3e5ab' },
    { id: 'f2', name: 'Rich Chocolate', price: 200, color: '#583e2e' },
    { id: 'f3', name: 'Zesty Lemon', price: 150, color: '#fcf4a3' },
    { id: 'f4', name: 'Red Velvet', price: 250, color: '#a02b37' },
    { id: 'f5', name: 'Strawberry', price: 200, color: '#f7c5cc' },
    { id: 'f6', name: 'Matcha', price: 300, color: '#a3b899' },
    { id: 'f7', name: 'Caramel', price: 250, color: '#c68324' },
  ],
  sizes: [
    { id: 's1', name: '6" Round', serves: '6-8', price: 0 },
    { id: 's2', name: '8" Round', serves: '10-12', price: 800 },
    { id: 's3', name: '10" Round', serves: '16-20', price: 1500 },
    { id: 's4', name: 'Two-Tier', serves: '25-30', price: 4000 },
  ],
  colors: [
    { id: 'c1', name: 'Classic White', hex_value: '#FFFFFF', price: 0 },
    { id: 'c2', name: 'Pastel Pink', hex_value: '#FFD1DC', price: 150 },
    { id: 'c3', name: 'Sky Blue', hex_value: '#87CEEB', price: 150 },
    { id: 'c4', name: 'Gold Accent', hex_value: '#FFD700', price: 500 },
  ],
  toppings: [
    { id: 't1', name: 'Fresh Berries', price: 400 },
    { id: 't2', name: 'Chocolate Drip', price: 300 },
    { id: 't3', name: 'Sprinkles', price: 100 },
    { id: 't4', name: 'Edible Flowers', price: 500 },
    { id: 't5', name: 'Macarons', price: 600 },
  ],
};
