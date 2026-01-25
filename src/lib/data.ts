import type { Cake, SpecialOffer, CustomizationOptions, Order, Flavor, Size, Color, Topping } from './types';

// Mock data for the application, providing a realistic frontend prototype experience.

export const cakes: Cake[] = [
    {
        id: 'chocolate-fudge-delight',
        name: 'Chocolate Fudge Delight',
        description: 'A rich and decadent chocolate fudge cake, layered with silky smooth chocolate ganache and topped with a glossy finish. A true indulgence for any chocolate lover.',
        base_price: 3200.00,
        image_id: 'special-offer-cake',
        rating: 4.9,
        category: 'Chocolate',
        customizable: true,
        orders_count: 150,
        ready_time: '24h',
        defaultFlavorId: 'f2',
    },
    {
        id: 'red-velvet-delight',
        name: 'Red Velvet Delight',
        description: 'The timeless classic. A moist, scarlet-hued cake with a hint of cocoa, perfectly balanced by our signature tangy cream cheese frosting.',
        base_price: 2800.00,
        image_id: 'red-velvet-delight',
        rating: 4.8,
        category: 'Classic',
        customizable: true,
        orders_count: 120,
        ready_time: '24h',
        defaultFlavorId: 'f3',
    },
    {
        id: 'strawberry-dream',
        name: 'Strawberry Dream',
        description: 'A light and fluffy vanilla sponge cake, layered with fresh strawberries and delicate whipped cream. This cake is not customizable and comes in a standard 8-inch size with our classic vanilla flavor.',
        base_price: 2500.00,
        image_id: 'strawberry-dream',
        rating: 4.7,
        category: 'Fruit',
        customizable: false,
        orders_count: 95,
        ready_time: '24h'
    },
    {
        id: 'lemon-zest-creation',
        name: 'Lemon Zest Creation',
        description: 'A zesty and refreshing lemon cake infused with fresh lemon juice and zest, topped with a sweet and tangy lemon glaze. This cake is not customizable and comes in a standard 8-inch size.',
        base_price: 2600.00,
        image_id: 'lemon-zest-creation',
        rating: 4.6,
        category: 'Fruit',
        customizable: false,
        orders_count: 80,
        ready_time: '24h'
    },
    {
        id: 'vanilla-bean-classic',
        name: 'Vanilla Bean Classic',
        description: 'A simple yet elegant cake made with real vanilla beans for a fragrant and sophisticated flavor. Perfect for any occasion.',
        base_price: 2400.00,
        image_id: 'vanilla-bean-classic',
        rating: 4.5,
        category: 'Classic',
        customizable: true,
        orders_count: 110,
        ready_time: '24h',
        defaultFlavorId: 'f1',
    },
    {
        id: 'matcha-elegance',
        name: 'Matcha Elegance',
        description: 'An earthy and refined cake featuring premium matcha green tea powder, offering a unique and subtle sweetness that is both calming and delightful.',
        base_price: 3000.00,
        image_id: 'matcha-elegance',
        rating: 4.7,
        category: 'Specialty',
        customizable: true,
        orders_count: 60,
        ready_time: '48h',
        defaultFlavorId: 'f1', // Assuming vanilla base can be used
    }
];

export const specialOfferCake = cakes.find(c => c.id === 'chocolate-fudge-delight');
export const specialOfferData = specialOfferCake ? {
    cake: specialOfferCake,
    discount_percentage: 20,
    original_price: specialOfferCake.base_price,
    special_price: specialOfferCake.base_price * (1 - 20 / 100),
    savings: specialOfferCake.base_price * (20 / 100),
} : null;

export const customizationOptions: CustomizationOptions = {
    flavors: [
        { id: 'f1', name: 'Classic Vanilla', price: 0.00, description: 'A timeless, aromatic flavor.', color: '#F3E5AB' },
        { id: 'f2', name: 'Rich Chocolate', price: 200.00, description: 'Deep, decadent, and dark.', color: '#5D4037' },
        { id: 'f3', name: 'Red Velvet', price: 250.00, description: 'A Southern classic with a hint of cocoa.', color: '#9B2C2C' },
        { id: 'f4', name: 'Zesty Lemon', price: 150.00, description: 'Bright, citrusy, and refreshing.', color: '#FBC02D' }
    ],
    sizes: [
        { id: 's1', name: '6" Cake', serves: '6-8 people', price: 0.00 },
        { id: 's2', name: '8" Cake', serves: '10-12 people', price: 500.00 },
        { id: 's3', name: '10" Cake', serves: '15-20 people', price: 1000.00 }
    ],
    colors: [
        { id: 'c1', name: 'Classic White', hex_value: '#FFFFFF', price: 0.00 },
        { id: 'c2', name: 'Pastel Pink', hex_value: '#FFD1DC', price: 100.00 },
        { id: 'c3', name: 'Sky Blue', hex_value: '#87CEEB', price: 100.00 },
        { id: 'c4', name: 'Vibrant Red', hex_value: '#FF0000', price: 150.00 }
    ],
    toppings: [
        { id: 't1', name: 'Rainbow Sprinkles', price: 50.00 },
        { id: 't2', name: 'Chocolate Drizzle', price: 100.00 },
        { id: 't3', name: 'Fresh Berries', price: 250.00 },
        { id: 't4', name: 'Edible Flowers', price: 300.00 }
    ]
};

export const orders: Order[] = [
    {
      id: 1,
      order_number: "WD1001",
      customer_name: "Jane Doe",
      customer_phone: "0712345678",
      delivery_method: "delivery",
      delivery_address: "123 Moi Avenue, Nairobi",
      total_price: 3200,
      deposit_amount: 2560,
      payment_status: "paid",
      order_status: "complete",
      created_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
      items: []
    },
    {
      id: 2,
      order_number: "WD1002",
      customer_name: "John Smith",
      customer_phone: "0787654321",
      delivery_method: "pickup",
      pickup_location: "Westlands Branch",
      total_price: 2800,
      deposit_amount: 2240,
      payment_status: "paid",
      order_status: "processing",
      created_at: new Date().toISOString(),
      items: []
    },
    {
      id: 3,
      order_number: "WD1003",
      customer_name: "Emily White",
      customer_phone: "0722000111",
      delivery_method: "delivery",
      delivery_address: "456 Ngong Road, Nairobi",
      total_price: 5200,
      deposit_amount: 4160,
      payment_status: "pending",
      order_status: "processing",
      created_at: new Date().toISOString(),
      items: []
    },
    {
      id: 4,
      order_number: "WD1004",
      customer_name: "Michael Brown",
      customer_phone: "0733444555",
      delivery_method: "delivery",
      delivery_address: "789 Thika Road, Nairobi",
      total_price: 2500,
      deposit_amount: 2000,
      payment_status: "paid",
      order_status: "cancelled",
      created_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
      items: []
    }
];
