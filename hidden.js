// Items available in the store
const items = [
    { name: "Attieke", image: "product_images/Attieke.jpg",weight:2.5, price:7, inventory: 20, quantityInCart: 0 },
    { name: "Red Palm Oil", image: "product_images/red_palmer.jpg",weight:2.5, price:7, inventory: 20, quantityInCart: 0 },
    { name: "Poisson Fumee", image: "product_images/poisson_fumee.jpg",weight:2.5, price:7, inventory: 20, quantityInCart: 0 },
    { name: "Petit Poisson ", image: "product_images/petit_poisson.jpg",weight:2.5, price:7, inventory: 20, quantityInCart: 0 },
    { name: "Placali", image:"out.jpg",weight:2.5, price:7, inventory: 20, quantityInCart: 0 },
];

// DOM elements
const itemsContainer = document.getElementById("items-container");
const checkoutItemsContainer = document.getElementById("checkout-items");
const totalPriceElement = document.getElementById("total-price");
const confirmButton = document.getElementById("confirm-order");

// Render the items in the store
function renderItems() {
    itemsContainer.innerHTML = ""; // Clear previous content
    items.forEach((item, index) => {
        const itemCard = document.createElement("div");
        itemCard.classList.add("item-card");
        const imageSrc = item.inventory === 0 ? "out.jpg" : item.image;
        const disabled = item.inventory === 0 ? "disabled" : "";

        itemCard.innerHTML = `
            <img src="${imageSrc}" alt="${item.name}">
            <div class="item-name">${item.name}</div>
            <div class="weight">${item.weight}Ibs</div>
            <div class="price">$${item.price}</div>
            <div class="inventory">Stock: ${item.inventory}</div>
            <div class="status">${item.inventory === 0 ? "Not Available" : ""}</div>
            <button class="item-button" onclick="addToCart(${index})" ${disabled}>Add to Cart</button>
        `;
        itemsContainer.appendChild(itemCard);
    });
}

// Add an item to the cart
function addToCart(index) {
    if (items[index].inventory > 0) {
        items[index].inventory--;
        items[index].quantityInCart++;
        updateCart();
        renderItems(); // Re-render items to update stock display
    } else {
        alert("Item is out of stock!");
    }
}

// Update the cart and total price display
function updateCart() {
    checkoutItemsContainer.innerHTML = ""; // Clear previous cart items
    let totalPrice = 0;
    let cartHasItems = false;

    items.forEach((item, index) => {
        if (item.quantityInCart > 0) {
            totalPrice += item.price * item.quantityInCart;
            const checkoutItem = document.createElement("div");
            checkoutItem.classList.add("checkout-item");
            checkoutItem.innerHTML = `
                <span>${item.name} - $${item.price} x ${item.quantityInCart}</span>
                <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
            `;
            checkoutItemsContainer.appendChild(checkoutItem);
            cartHasItems = true;
        }
    });

    totalPriceElement.innerHTML = `Total: $${totalPrice.toFixed(2)}`;
    confirmButton.style.display = cartHasItems ? "block" : "none";
}

// Remove an item from the cart
function removeFromCart(index) {
    if (items[index].quantityInCart > 0) {
        items[index].inventory++;
        items[index].quantityInCart--;
        updateCart();
        renderItems(); // Re-render items to update stock display
    }
}

// Confirm the order
function confirmOrder() {
    if (confirm("Do you really want to continue with this order?")) {
        const name = prompt("Enter your name:");
        const phone = prompt("Enter your phone number:");
        const message = prompt("Enter a message for your order:");

        if (name && phone && message) {
            const orderNumber = `ORD-${Date.now()}`;
            let emailContent = `Order Number: ${orderNumber}\nName: ${name}\nPhone: ${phone}\nMessage: ${message}\n\nOrder Details:\n`;

            // Add item details to the email content
            let totalPrice = 0;
            items.forEach(item => {
                if (item.quantityInCart > 0) {
                    emailContent += `${item.name} - Quantity: ${item.quantityInCart}, Price: $${item.price}\n`;
                    totalPrice += item.price * item.quantityInCart;
                }
            });
            emailContent += `\nTotal Price: $${totalPrice.toFixed(2)}`;

            // Send email with order details
            emailjs.send("service_9opq1j8","template_wwoh33j", {
                orderNumber,
                name,
                phone,
                message,
                emailContent // Include the full order details
            }).then(function(res) {
                console.log("Email sent successfully:", res.status);

                // Only decrease stock after successful email sending
                items.forEach(item => {
                    if (item.quantityInCart > 0) {
                        item.inventory -= item.quantityInCart; // Permanently decrease stock
                        item.quantityInCart = 0; // Reset cart quantity after order
                    }
                });

                renderItems(); // Re-render items to reflect permanent stock changes
                resetCart();
                alert(`Thank you for ordering! Your order number is: ${orderNumber}`);
            }).catch(function(error) {
                console.error("Error sending email:", error);
                alert("Failed to send the order email. Please try again.");
            });
        } else {
            alert("Please fill out all fields to complete your order.");
        }
    }
}
// Reset the cart after order confirmation
function resetCart() {
    items.forEach(item => {
        item.quantityInCart = 0; // Reset quantities in cart
    });
    updateCart();
}

// Initialize the store display
renderItems();

/*
function confirmOrder() {
    if (confirm("Do you really want to continue with this order?")) {
        const name = prompt("Enter your name:");
        const phone = prompt("Enter your phone number:");
        const message = prompt("Enter a message for your order:");

        if (name && phone && message) {
            const orderNumber = `ORD-${Date.now()}`;
            alert(`Thank you for ordering! Your order number is: ${orderNumber}`);

            emailjs.send("service_9opq1j8","template_wwoh33j",{orderNumber,name,phone,message}).then(function(res){
                console.log(res.status);
            });

            // Decrease stock permanently for items in the cart
            items.forEach(item => {
                if (item.quantityInCart > 0) {
                    item.inventory -= item.quantityInCart; // Permanently decrease stock
                    item.quantityInCart = 0; // Reset cart quantity after order
                }
            });

            renderItems(); // Re-render items to reflect permanent stock changes
            resetCart();
        } else {
            alert("Please fill out all fields to complete your order.");
        }
    }
}

// Send order details via email
/*
function sendOrderEmail(orderNumber, name, phone, message) {
    const emailBody = new URLSearchParams({
        from: "juniorgme000@gmail.com",
        to: "juniorgme000@gmail.com",
        subject: "New Order Received",
        text: `Order Number: ${orderNumber}\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`
    });

    fetch("sandboxbc1377c76a4f4f4c9cdb922fa091cc70.mailgun.org", {
        method: "POST",
        headers: {
            Authorization: "Basic " + btoa("api:dc499d41c4e28ed9d070acf381e766f4-2e68d0fb-644d3639"),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: emailBody
    })
    .then(response => response.ok ? console.log("Email sent successfully") : console.error("Failed to send email"))
    .catch(error => console.error("Error sending email:", error));
}


// Reset the cart after order confirmation
function resetCart() {
    items.forEach(item => {
        item.quantityInCart = 0; // Reset quantities in cart
    });
    updateCart();
}

// Initialize the store display
renderItems();
*/