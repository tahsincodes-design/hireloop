const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const checkoutVerify = async (sessionId: string) => {
    const response = await fetch(`${BASE_URL}/payment/checkout-verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({sessionId})
    })
    return response.json()
}