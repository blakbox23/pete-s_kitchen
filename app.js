//map variables to html elements

const cartBtn=document.querySelector(".cart-btn");
const closeCartBtn=document.querySelector(".close-cart");
const clearcartBtn=document.querySelector(".clear-cart");
const checkOutBtn= document.getElementById("check-out")
const cartDOM=document.querySelector(".cart");
const cartOverlay=document.querySelector(".cart-overlay");
const cartItems=document.querySelector(".cart-items");
const cartTotal=document.querySelector(".cart-total");
const cartContent=document.querySelector(".cart-content");
const productsDOM=document.querySelector(".products-center");
const sendEmailBtn= document.getElementById("send-email");


// cart
let cart =[];
//buttons
let buttonsDOM= [];

//getting the products
class Products{
  async getProducts(){
      try{
        let result= await fetch('products.json');
        let data= await result.json();
        //return data;
        let products= data.items;
        products= products.map(item=>{
           const{title,price} =item.fields
           const{id}=item.sys;
           const image= item.fields.image.fields.file.url;
           return{title,price,id,image}


        })
        return products
      }catch (error){
        console.log(error);
        
      }
   
  }
}
// display products
class UI {
displayProducts(products){
    let result ="";
    products.forEach(product=>{
    result+=  `
    <!--single product-->
    <article class='product'>
        <div class="img-container">
            <img src=${product.image} "alt="products" class="product-img"/>
            
            <p class="prod-desc prod-name"> ${product.title}</p>
            <hr/>
             <p class="prod-desc">750 ml</p>
            <hr/>   
          <div class="items price prod-desc">
            <p>Price: ${product.price} </p>
            <hr/>
        </div>
        <button class="bag-btn" data-id=${product.id}>
        <i class="fas fa-shopping-cart"></i>
        add to bag
    </button>
    </article>

    <!--End of single product-->  
    ` 
    });
    productsDOM.innerHTML=result;
}
    getBagButtons(){
        const buttons= [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button=>{
           let id = button.dataset.id; 
           let inCart= cart.find(item=> item.id===id);
           if(inCart){
               button.innerText = "In Cart";
               button.disabled=true
           }
               button.addEventListener('click',(event)=>{
                event.target.innerText = "In Cart";
                event.target.disabled= true;
                //get product from products
                let cartItem = {...Storage.getProduct(id),
                amount: 1};
                
                //add product to the cart
                cart= [...cart, cartItem];
                //save cart in local storage
                Storage.saveCart(cart);
                //set cart values
                this.setCartValues(cart);
                //display cart item
                this.addCartItem(cartItem);
                //show cart
                //this.showCart();
               })
           
        });    
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item=>{
            tempTotal += item.price*item.amount;
            itemsTotal += item.amount
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText= itemsTotal;  
    }
    addCartItem(item){
        const div= document.createElement("div")
        div.classList.add('cart-item');
        div.innerHTML=`
        <img src=${item.image}
         alt="product">
        <div>
            <h4> ${item.title}</h4>
            <h3>Ksh${item.price}</h3>
            <span class="remove-item" data-id=${item.id}>Remove</span>
        </div>
        <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
           <p class="item-amount">${item.amount}</p> 
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
        `
        cartContent.appendChild(div);     
        
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    setupAPP(){
        cart= Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click',this.hideCart )
    }
    populateCart(cart){
        cart.forEach(item=>this.addCartItem(item));
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic(){
        //clear cart button
        clearcartBtn.addEventListener('click',()=>{
           this.clearCart();
        });
        checkOutBtn.addEventListener('click',()=>{
            this.checkOut();
        })
        sendEmailBtn.addEventListener('click',()=>{
            this.sendEmail();
        })

        //cart functionality
        cartContent.addEventListener('click', ()=>{
            if(event.target.classList.contains('remove-item')){
                let removeItem= event.target;
                let id= removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);       
                this.removeItem(id);     
            }else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem=cart.find(item =>item.id=== id);
                tempItem.amount= tempItem.amount+1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText= tempItem.amount;               
            }else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem=cart.find(item =>item.id=== id);
                tempItem.amount= tempItem.amount-1;
                if(tempItem.amount >0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText= tempItem.amount;
                }else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
            
        })
    }
    clearCart(){
        let cartItems = cart.map(item=>item.id);
        cartItems.forEach(id => this.removeItem(id))
        
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        } 
        this.hideCart();      
    }
    checkOut(){
        let orders = [];
        
        let cartItems = cart.map(item=>item.id);
        let cartname = cart.map(item=>item.title);
        let cartprice = cart.map(item=>item.price);
        let cartamount = cart.map(item=>item.amount);
        let prod1={name:cartname[0], amount:cartamount[0], price:cartprice[0]};
        let prod2={name:cartname[1], amount:cartamount[1], price:cartprice[1]};
        let prod3={name:cartname[2], amount:cartamount[2], price:cartprice[2]};
        let prod4={name:cartname[3], amount:cartamount[3], price:cartprice[4]};
        let prod5={name:cartname[4], amount:cartamount[4], price:cartprice[4]};
       // console.log(cartItems[0],cartname[0], cartamount[0], cartprice[0])
    
        orders.push(prod1);
        orders.push(prod2);
        orders.push(prod3);
        orders.push(prod4);
        orders.push(prod5);
        
        //console.log(orders);
        let orderTotal= document.getElementById('cart-total').innerHTML
        
       orders.forEach(element => {
           if(element.name !== undefined){
               let sendOrder = [ element.name, element.amount, element.price]

           }   
       }          
       );
        //console.log("Total: "+orderTotal);  
        console.log(cartname.toString(), cartamount.toString(), orderTotal)

        if(orderTotal==0 || !document.getElementById("customer-name").value || !document.getElementById("customer-email").value){
            alert("Please order from our menu and Ensure to use the correct Name and Email to Proceed. Thank You");
        }else{

        this.sendEmail();
        }
         
        //send the order to EMAIL
        
        this.clearCart();     
    }


    sendEmail=()=> {
        
        //name
        //number from form by id and value

        let orderTotal= document.getElementById('cart-total').innerHTML
        let newMessage= 'Your Order Has Been Received We will Contact you Shortly';
        let customerName = document.getElementById("customer-name").value;
        let email = document.getElementById("customer-email").value;


        Email.send({
            Host: "smtp.mailtrap.io",
            Username: "34ba243658d3f8",
            Password: "f68327690afa49",
            To : 'receiver@gmail.com',
            From : "sender@example.com",
            Subject : "Test email",
            Body : `Cart Items : ${cart.map(item=>item.title)} Amount for Each : ${cart.map(item=>item.amount)} Total :${orderTotal} \n\n
            name: ${customerName}, email : ${email}`
        }).then(
          message => alert(newMessage)
        );
        }

    removeItem(id){
        cart = cart.filter(item=> item.id !==id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled=false;
        button.innerHTML=`<i class ="fas fa-shopping-cart"></i>add to bag`;
    }

  
    
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id===id);
    }
}
//locals storage
class Storage{
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products)
        );
    }
    static getProduct(id){
        let products= JSON.parse(localStorage.getItem('products'));
        return products.find(product=>product.id===id)
    }
    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse
        (localStorage.getItem('cart')): []
    }
}

document.addEventListener("DOMContentLoaded", ()=>{
    const ui=new UI();
    const products = new Products();
    //setup app
    ui.setupAPP();

//get all products
products.getProducts().then(products=>{
    ui.displayProducts(products);
    Storage.saveProducts(products);
}).then(()=>{
    ui.getBagButtons();
    ui.cartLogic();
});

});