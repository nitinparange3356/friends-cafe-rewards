import { MenuItem } from "@/types";

export const menuItems: MenuItem[] = [
  // Coffee
  { id: "c1", name: "Cappuccino", description: "Rich espresso with steamed milk foam and a hint of cocoa", price: 149, actual_price: 199, offer: 25, category: "Coffee", veg_type: "veg", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop", available: true },
  { id: "c2", name: "Cold Brew", description: "Smooth, slow-steeped cold coffee served over ice", price: 179, actual_price: 229, offer: 22, category: "Coffee", veg_type: "veg", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop", available: true },
  { id: "c3", name: "Caramel Latte", description: "Espresso blended with steamed milk and sweet caramel drizzle", price: 199, actual_price: 249, offer: 20, category: "Coffee", veg_type: "veg", image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop", available: true },
  { id: "c4", name: "Mocha Frappe", description: "Blended iced coffee with chocolate and whipped cream", price: 229, actual_price: 279, offer: 18, category: "Coffee", veg_type: "veg", image: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=400&h=300&fit=crop", available: true },
  // Burgers
  { id: "b1", name: "Classic Chicken Burger", description: "Juicy grilled chicken patty with fresh lettuce and special sauce", price: 179, actual_price: 229, offer: 22, category: "Burgers", veg_type: "non-veg", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", available: true },
  { id: "b2", name: "Veggie Burger", description: "Crispy veggie patty with cheese, onions, and tangy mayo", price: 149, actual_price: 189, offer: 21, category: "Burgers", veg_type: "veg", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop", available: true },
  { id: "b3", name: "Egg Burger", description: "Double egg patty with cheese slice and pickled jalapeños", price: 159, actual_price: 199, offer: 20, category: "Burgers", veg_type: "egg", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop", available: true },
  // Snacks
  { id: "s1", name: "French Fries", description: "Crispy golden fries seasoned with herbs and spices", price: 99, actual_price: 129, offer: 23, category: "Snacks", veg_type: "veg", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop", available: true },
  { id: "s2", name: "Chicken Wings", description: "Spicy buffalo wings with blue cheese dip", price: 249, actual_price: 299, offer: 17, category: "Snacks", veg_type: "non-veg", image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop", available: true },
  { id: "s3", name: "Paneer Tikka", description: "Grilled cottage cheese marinated in aromatic spices", price: 199, actual_price: 249, offer: 20, category: "Snacks", veg_type: "veg", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop", available: true },
  // Combos
  { id: "co1", name: "Burger + Fries + Drink", description: "Classic chicken burger with fries and a cold drink", price: 299, actual_price: 399, offer: 25, category: "Combos", veg_type: "non-veg", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop", available: true },
  { id: "co2", name: "Coffee + Dessert Combo", description: "Any cappuccino with a slice of chocolate cake", price: 249, actual_price: 349, offer: 29, category: "Combos", veg_type: "veg", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop", available: true },
  // Desserts
  { id: "d1", name: "Chocolate Brownie", description: "Warm fudgy brownie topped with vanilla ice cream", price: 179, actual_price: 229, offer: 22, category: "Desserts", veg_type: "veg", image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=300&fit=crop", available: true },
  { id: "d2", name: "Cheesecake", description: "New York style creamy cheesecake with berry compote", price: 219, actual_price: 279, offer: 22, category: "Desserts", veg_type: "veg", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop", available: true },
  // Drinks
  { id: "dr1", name: "Fresh Lime Soda", description: "Refreshing lime soda with mint leaves", price: 79, actual_price: 99, offer: 20, category: "Drinks", veg_type: "veg", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=400&h=300&fit=crop", available: true },
  { id: "dr2", name: "Mango Smoothie", description: "Thick and creamy mango smoothie blended with yogurt", price: 149, actual_price: 189, offer: 21, category: "Drinks", veg_type: "veg", image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop", available: true },
  { id: "dr3", name: "Iced Tea", description: "Chilled peach iced tea with a hint of lemon", price: 99, actual_price: 129, offer: 23, category: "Drinks", veg_type: "veg", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", available: true },
];

export const categories = ["Coffee", "Burgers", "Snacks", "Combos", "Desserts", "Drinks"] as const;
