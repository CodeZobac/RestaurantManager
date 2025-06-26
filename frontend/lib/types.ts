export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  password?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  restaurant_id?: string;
}
