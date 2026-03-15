const fs = require('fs');
let content = fs.readFileSync('product.html', 'utf8');

content = content.replace(
    '<button class="btn btn-add-cart"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>\r\n                <button class="btn btn-primary btn-buy-now"><i class="fa-solid fa-bolt"></i> Buy Now</button>',
    '<button class="btn btn-add-cart" id="page-add-cart"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>\r\n                <button class="btn btn-primary btn-buy-now" id="page-buy-now"><i class="fa-solid fa-bolt"></i> Buy Now</button>'
);
content = content.replace(
    '<button class="btn btn-add-cart"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>\n                <button class="btn btn-primary btn-buy-now"><i class="fa-solid fa-bolt"></i> Buy Now</button>',
    '<button class="btn btn-add-cart" id="page-add-cart"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>\n                <button class="btn btn-primary btn-buy-now" id="page-buy-now"><i class="fa-solid fa-bolt"></i> Buy Now</button>'
);

content = content.replace(
    'fitmentTbody.innerHTML = fitmentHTML;\r\n        });',
    `fitmentTbody.innerHTML = fitmentHTML;\r\n\r\n            const productData = {\r\n                id: partNoVal,\r\n                title: fullTitle,\r\n                price: parseInt(priceVal) || 0,\r\n                img: document.getElementById('main-product-img').src\r\n            };\r\n            \r\n            document.getElementById('page-add-cart').addEventListener('click', () => {\r\n                if (window.addToCart) window.addToCart(productData);\r\n            });\r\n            document.getElementById('page-buy-now').addEventListener('click', () => {\r\n                if (window.buyNow) window.buyNow(productData);\r\n            });\r\n        });`
);
content = content.replace(
    'fitmentTbody.innerHTML = fitmentHTML;\n        });',
    `fitmentTbody.innerHTML = fitmentHTML;\n\n            const productData = {\n                id: partNoVal,\n                title: fullTitle,\n                price: parseInt(priceVal) || 0,\n                img: document.getElementById('main-product-img').src\n            };\n            \n            document.getElementById('page-add-cart').addEventListener('click', () => {\n                if (window.addToCart) window.addToCart(productData);\n            });\n            document.getElementById('page-buy-now').addEventListener('click', () => {\n                if (window.buyNow) window.buyNow(productData);\n            });\n        });`
);

fs.writeFileSync('product.html', content);
console.log('product.html updated successfully');
