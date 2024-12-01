// Sample Items
const items = [
    { name: "Item 1", image: "download.jpg", price: 20, quantity: 0 },
    { name: "Item 2", image: "down.jpg", price: 30, quantity: 0 },
    { name: "Item 3", image: "download.jpg", price: 25, quantity: 0 },
  ];
  
  // Render items to the page
  const itemsContainer = document.getElementById("items-container");
  items.forEach((item, index) => {
    const itemCard = document.createElement("div");
    itemCard.classList.add("item-card");
    itemCard.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="item-name">${item.name}</div>
      <div class="price">$${item.price}</div>
      <input type="number" id="quantity-${index}" value="1" min="1">
      <button onclick="addToCart(${index})">Add to Cart</button>
    `;
    itemsContainer.appendChild(itemCard);
  });
  
  // Add item to cart
  function addToCart(index) {
    const quantity = parseInt(document.getElementById(`quantity-${index}`).value);
    if (quantity > 0) {
      items[index].quantity = quantity;
    }
    updateCheckout();
  }
  
  // Update the checkout section
  function updateCheckout() {
    const checkoutItemsContainer = document.getElementById("checkout-items");
    checkoutItemsContainer.innerHTML = ''; // Clear previous items
    let totalPrice = 0;
    let cartHasItems = false;
  
    items.forEach((item, index) => {
      if (item.quantity > 0) {
        totalPrice += item.price * item.quantity;
        const checkoutItem = document.createElement("div");
        checkoutItem.classList.add("checkout-item");
        checkoutItem.innerHTML = `
          <span>${item.name} - $${item.price} x ${item.quantity}</span>
          <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
        `;
        checkoutItemsContainer.appendChild(checkoutItem);
        cartHasItems = true;
      }
    });
  
    // Update total price
    const totalPriceElement = document.getElementById("total-price");
    totalPriceElement.innerHTML = `Total: $${totalPrice.toFixed(2)}`;
  
    // Show or hide the confirm button based on cart status
    const confirmButton = document.getElementById("confirm-order");
    confirmButton.style.display = cartHasItems ? "block" : "none";
  }
  
  // Remove an item from the cart
  function removeItem(index) {
    items[index].quantity = 0;
    updateCheckout();
  }
  
  // Handle order confirmation
  document.getElementById("confirm-order").addEventListener("click", () => {
    const cartHasItems = items.some(item => item.quantity > 0);
  
    if (cartHasItems) {
      document.getElementById("confirmation-modal").style.display = "flex";
    } else {
      alert("Your cart is empty! Please add items to your cart before confirming.");
    }
  });
  
  // Handle confirmation modal actions
  document.getElementById("confirm-yes").addEventListener("click", () => {
    document.getElementById("confirmation-modal").style.display = "none";
    document.getElementById("user-info-form").style.display = "block";
    document.getElementById("user-info-form").scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  
  document.getElementById("confirm-no").addEventListener("click", () => {
    document.getElementById("confirmation-modal").style.display = "none";
  });
  
  // Submit order
  document.getElementById("user-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
  
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
  
    if (name && phone && email && address) {
      const orderData = {
        userName: name,
        userPhone: phone,
        userEmail: email,
        userAddress: address,
        cart: items.filter(item => item.quantity > 0),
        totalPrice: items.reduce((total, item) => total + item.price * item.quantity, 0)
      };
  
      try {
        const response = await fetch("http://localhost:3000/submit-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(orderData)
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const result = await response.json();
  
        if (result.success) {
          alert(result.message);
          resetCart();
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Thank you we will contact you shortly.");
      }
    } else {
      alert("Please fill in all the fields.");
    }
  });
  
  // Reset cart after successful order
  function resetCart() {
    items.forEach(item => (item.quantity = 0));
    updateCheckout();
    document.getElementById("user-info-form").style.display = "none";
  }
  