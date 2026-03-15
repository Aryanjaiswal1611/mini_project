const http = require('http');

async function testCart() {
    console.log("Starting test...");
    // 1. Get food items
    // const fetch = (await import('node-fetch')).default;
    const resFoods = await fetch('http://localhost:3000/api/foods');
    const foods = await resFoods.json();
    if (!foods.success || foods.foods.length === 0) return console.log("No foods.");
    const foodId = foods.foods[0]._id;
    
    // 2. Signup / Login to get cookie
    const resAuth = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    let authData = await resAuth.json();
    let cookie = resAuth.headers.get('set-cookie');
    
    if (!authData.success) {
        // Try signup
        const resSignup = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'password123', confirm_password: 'password123' })
        });
        authData = await resSignup.json();
        cookie = resSignup.headers.get('set-cookie');
    }
    
    console.log("Logged in:", authData);
    
    // 3. Add to cart
    const resCart = await fetch('http://localhost:3000/api/cart/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify({ food_id: foodId })
    });
    
    const cartData = await resCart.json();
    console.log("Add to Cart Response:", cartData);
}

testCart();
