/*
=========================================
EXERCISES - ADVANCED PROMISES AND ASYNC/AWAIT
=========================================

=================================================
PART 1 - ADVANCED PROMISES
=================================================

1. Login Simulation
Create a function login(user, password) that returns a Promise.
- Resolve after 2 seconds if the user and password are correct.
- Reject with the message "Invalid username or password" otherwise.
*/
function login(username, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (username === 'berg' && password === '123456') {
                resolve('User logged in');
            } else {
                reject('Invalid username or password');
            }
        }, 2000);
    });
}

login('berg', '123456')
    .then((result) => console.log(result))
    .catch((error) => console.log(error));


/*
2. Order Processing
Create a function processOrder(product) that:
- Resolves in 3 seconds if the product exists.
- Rejects if the product does not exist.
Use .then(), .catch() and .finally() to handle the result.
*/
function processOrder(product) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const availableProducts = ['apple', 'mouse', 'keyboard', 'key'];
            if (availableProducts.includes(product)) {
                resolve('Product found');
            } else {
                reject('Product not found');
            }
        }, 3000);
    });
}

processOrder('mouse')
    .then((result) => console.log(result))
    .catch((error) => console.log(error))
    .finally(() => console.log('Search completed'));


/*
3. Promise.all()
Create three Promises that simulate:
- Fetch user (2s)
- Fetch orders (3s)
- Fetch address (1s)
Use Promise.all() to wait for all and display:
User:
Orders:
Address:
*/
function getUser() {
    return new Promise((resolve) => {
        setTimeout(() => resolve("Berg"), 2000);
    });
}

function getOrders() {
    return new Promise((resolve) => {
        setTimeout(() => resolve(["Mouse", "Keyboard", "Monitor"]), 1000);
    });
}

function getAddress() {
    return new Promise((resolve) => {
        setTimeout(() => resolve("Street A"), 1000);
    });
}

Promise.all([getUser(), getOrders(), getAddress()])
    .then(([user, orders, address]) => {
        console.log("User:", user);
        console.log("Orders:", orders);
        console.log("Address:", address);
    })
    .catch((error) => console.error("Something went wrong:", error));


/*
4. Promise.race()
Create two Promises:
- Server A responds in 2 seconds.
- Server B responds in 4 seconds.
Use Promise.race() to show which responded first.
*/
const serverA = new Promise((resolve) => {
    setTimeout(() => resolve('Server A'), 2000);
});

const serverB = new Promise((resolve) => {
    setTimeout(() => resolve('Server B'), 4000);
});

Promise.race([serverA, serverB]).then((result) => {
    console.log('First server to respond:', result);
});


/*
5. Promise Chaining
Create a flow where:
Step 1 → Fetch user
Step 2 → Fetch purchases
Step 3 → Calculate total spent
Each step must return a Promise.
Use chaining with .then().
*/
function getUser() {
    return new Promise((resolve) => {
        setTimeout(() => resolve("Berg"), 2000);
    });
}

function getShopping() {
    return new Promise((resolve) => {
        setTimeout(() => resolve(["Mouse", "Keyboard", "Monitor"]), 3000);
    });
}

function calculateTotalSpent() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const spent = [50, 100, 200];
            const total = spent.reduce((acc, curr) => acc + curr, 0);
            resolve(total);
        }, 4000);
    });
}

getUser()
    .then((user) => {
        console.log('User fetched:', user);
        return getShopping();
    })
    .then((shopping) => {
        console.log('Shopping:', shopping);
        return calculateTotalSpent();
    })
    .then((total) => {
        console.log('Total spent:', total);
    });


/*
=================================================
PART 2 - ASYNC / AWAIT
=================================================

6. Fetch Data
Transform the Login exercise using async/await.
*/
async function login(username, password) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (username !== 'berg' || password !== '123456') {
        throw new Error('Invalid username or password');
    }
    return 'User successfully logged in';
}

async function authenticateUser() {
    try {
        console.log('Logging in...');
        const message = await login('berg', '123456');
        console.log(message);
    } catch (error) {
        console.error(error.message);
    }
}

authenticateUser();


/*
7. Complete Registration
Create async functions:
- registerUser()
- sendEmail()
- generateReport()
Use await to execute them in the correct order.
*/
function registerUser(name, password) {
    return new Promise((resolve, reject) => {
        if (name && password) {
            resolve(`User registration successful: ${name}`);
        } else {
            reject(new Error('User registration failed'));
        }
    });
}

function sendEmail(email) {
    return new Promise((resolve, reject) => {
        if (email) {
            resolve(`Email sent successfully to: ${email}`);
        } else {
            reject(new Error('Failed to send email'));
        }
    });
}

function generateReport() {
    return new Promise((resolve) => {
        setTimeout(() => resolve('Report generated successfully'), 2000);
    });
}

async function userFlow() {
    try {
        console.log('Starting registration process...');
        const registered = await registerUser('berg', '123456');
        console.log('Registration:', registered);
        
        const emailStatus = await sendEmail('berg@gmail.com');
        console.log('Email:', emailStatus);
        
        const report = await generateReport();
        console.log('Report:', report);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

userFlow();


/*
8. Error Handling
Create a function getProduct(id).
If the id exists → return the product.
If not → throw an error.
Use try/catch.
*/
const products = [
    { id: 1, name: "Wireless Headphones", price: 149.99, category: "Electronics", stock: 25 },
    { id: 2, name: "Mechanical Keyboard", price: 89.99, category: "Accessories", stock: 40 },
    { id: 3, name: "Gaming Mouse", price: 59.99, category: "Accessories", stock: 15 },
    { id: 4, name: "Smart Watch", price: 199.99, category: "Wearables", stock: 0 },
    { id: 5, name: "Laptop", price: 1299.99, category: "Computers", stock: 10 }
];

function getProduct(productId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const product = products.find(p => p.id === productId);
            if (!product) return reject(new Error("Product not found"));
            resolve(product);
        }, 1000);
    });
}

const store = async () => {
    try {
        console.log("Searching for product...");
        const product = await getProduct(1);
        console.log("Product found:", {
            name: product.name,
            price: `$${product.price}`,
            category: product.category,
            available: product.stock > 0
        });
    } catch (error) {
        console.error("Error:", error.message);
    }
};

store();


/*
9. Parallel Data Fetching
Create three async functions:
- fetchCustomers()
- fetchProducts()
- fetchSales()
Use Promise.all() with async/await to fetch everything at the same time.
*/
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchCustomers() {
    await wait(1000);
    return [
        { id: 1, name: "John Smith", email: "john@email.com" },
        { id: 2, name: "Mary Johnson", email: "mary@email.com" },
        { id: 3, name: "Peter Brown", email: "peter@email.com" }
    ];
}

async function fetchProducts() {
    await wait(1500);
    return [
        { id: 1, name: "Laptop", price: 3500 },
        { id: 2, name: "Mouse", price: 80 },
        { id: 3, name: "Keyboard", price: 150 }
    ];
}

async function fetchSales() {
    await wait(800);
    return [
        { id: 1, customerId: 1, productId: 2, quantity: 1 },
        { id: 2, customerId: 2, productId: 1, quantity: 1 },
        { id: 3, customerId: 3, productId: 3, quantity: 2 }
    ];
}

async function loadData() {
    try {
        const [customers, products, sales] = await Promise.all([
            fetchCustomers(),
            fetchProducts(),
            fetchSales()
        ]);
        console.log("Customers:", customers);
        console.log("Products:", products);
        console.log("Sales:", sales);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

loadData();


/*
10. Final Challenge
Simulate an online store.
Create functions:
- login()
- getProducts()
- addProductToCart()
- checkout()
All must return Promises.
Use async/await to run the flow:
Login → Get Products → Add to Cart → Checkout
If any step fails, stop the process using try/catch.
*/
const storeProducts = [
    { id: 1, name: "Wireless Headphones", price: 149.99 },
    { id: 2, name: "Mechanical Keyboard", price: 89.99 },
    { id: 3, name: "Gaming Mouse", price: 59.99 },
    { id: 4, name: "Smart Watch", price: 199.99 },
    { id: 5, name: "Laptop", price: 1299.99 }
];

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(username, password) {
    await delay(2000);
    if (username !== "berg" || password !== "123456") {
        throw new Error("Invalid username or password.");
    }
    return { message: "User successfully logged in.", username };
}

async function getProducts() {
    await delay(3000);
    return storeProducts;
}

async function addProductToCart(name, price) {
    await delay(4000);
    if (!name || price <= 0) throw new Error("Invalid product information.");
    
    const newProduct = { id: storeProducts.length + 1, name, price };
    storeProducts.push(newProduct);
    return { message: "Product added to cart.", products: storeProducts };
}

async function checkout() {
    await delay(5000);
    const total = storeProducts.reduce((sum, p) => sum + p.price, 0);
    return {
        message: "Purchase completed successfully.",
        items: storeProducts,
        totalAmount: total.toFixed(2)
    };
}

async function onlineStore() {
    try {
        const user = await login("berg", "123456");
        console.log(user);

        const products = await getProducts();
        console.log("Available products:", products);

        const cart = await addProductToCart("Smartphone", 599.99);
        console.log(cart);

        const order = await checkout();
        console.log(order);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

onlineStore();