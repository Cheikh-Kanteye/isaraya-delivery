export interface Order {
  id: string;
  restaurant: string;
  customer: string;
  address: string;
  items: number;
  distance: string;
  time: string;
  earnings: number;
  status: 'available' | 'accepted' | 'picked_up' | 'delivered' | 'rejected';
  urgent: boolean;
  lat: number; // Added for map markers
  lng: number; // Added for map markers
}
