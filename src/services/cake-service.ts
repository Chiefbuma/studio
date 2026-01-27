
import type { Cake, SpecialOffer, CustomizationOptions, Order, LoginCredentials, SpecialOfferUpdatePayload, CustomizationCategory, CustomizationData } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to get auth token from localStorage
const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// Generic function to handle API responses and extract error messages
async function getErrorFromResponse(response: Response): Promise<Error> {
    try {
        const errorData = await response.json();
        return new Error(errorData.message || 'An unknown error occurred.');
    } catch {
        return new Error('An unknown error occurred and the response was not valid JSON.');
    }
}


// --- FETCH (GET) Functions ---

export async function getCakes(): Promise<Cake[]> {
  try {
    const res = await fetch(`${API_URL}/cakes`);
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
  } catch (error) {
    console.error('[GET_CAKES_ERROR]', error);
    throw error;
  }
}

export async function getSpecialOffer(): Promise<SpecialOffer | null> {
    try {
        const res = await fetch(`${API_URL}/special-offer`);
        if (res.status === 404) return null;
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error('[GET_SPECIAL_OFFER_ERROR]', error);
        throw error;
    }
}

export async function getCustomizationOptions(): Promise<CustomizationOptions> {
    try {
        const res = await fetch(`${API_URL}/customizations`);
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error('[GET_CUSTOMIZATIONS_ERROR]', error);
        throw error;
    }
}

export async function getCustomCake(): Promise<Cake | null> {
    try {
        const allCakes = await getCakes();
        return allCakes.find(c => c.id === 'custom-cake') || null;
    } catch (error) {
        console.error('[GET_CUSTOM_CAKE_ERROR]', error);
        return null;
    }
}

export async function getOrders(): Promise<Order[]> {
    try {
        const res = await fetch(`${API_URL}/orders`, { headers: getAuthHeaders() });
        if (!res.ok) throw await getErrorFromResponse(res);
        const data = await res.json();
        return data.sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
        console.error('[GET_ORDERS_ERROR]', error);
        throw error;
    }
}


// --- MUTATION (POST, PUT, DELETE) Functions ---

export async function loginAdmin(credentials: LoginCredentials): Promise<{ token: string }> {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function createCake(cakeData: Partial<Cake>): Promise<Cake> {
    const res = await fetch(`${API_URL}/cakes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cakeData),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function updateCake(id: string, cakeData: Partial<Cake>): Promise<Cake> {
    const res = await fetch(`${API_URL}/cakes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(cakeData),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function deleteCake(cakeId: string): Promise<Response> {
    const res = await fetch(`${API_URL}/cakes/${cakeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res;
}

export async function updateSpecialOffer(payload: SpecialOfferUpdatePayload): Promise<SpecialOffer> {
    const res = await fetch(`${API_URL}/special-offer`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function createCustomizationOption(category: CustomizationCategory, data: CustomizationData): Promise<CustomizationData> {
     const res = await fetch(`${API_URL}/customizations/${category}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function updateCustomizationOption(category: CustomizationCategory, id: string, data: CustomizationData): Promise<CustomizationData> {
     const res = await fetch(`${API_URL}/customizations/${category}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function deleteCustomizationOption(category: CustomizationCategory, id: string): Promise<Response> {
    const res = await fetch(`${API_URL}/customizations/${category}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res;
}

export async function updateOrderStatus(orderId: number, status: 'processing' | 'complete' | 'cancelled'): Promise<Order> {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

    