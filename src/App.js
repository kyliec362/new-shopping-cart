import React, { useEffect, useState } from 'react';
import { Grid } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import { Checkbox } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import Fab from '@material-ui/core/Fab';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import Modal from '@material-ui/core/Modal';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { Message } from "rbx";
import Select from '@material-ui/core/Select';

const availableSizes = ['S', 'M', 'L', 'XL'];

const firebaseConfig = {
  apiKey: "AIzaSyCybllzB-XTvyi0rZ2E1eUsGx0ytx1i9NI",
  authDomain: "new-shopping-cart-9fd64.firebaseapp.com",
  databaseURL: "https://new-shopping-cart-9fd64.firebaseio.com",
  projectId: "new-shopping-cart-9fd64",
  storageBucket: "new-shopping-cart-9fd64.appspot.com",
  messagingSenderId: "199856128773",
  appId: "1:199856128773:web:fbb27fdc7fc1929b736d6c",
  measurementId: "G-KZDM27XZ7M"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref();
const dbInventory = db.child("inventory");

// AUTH UI
const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false
  }
};

const Welcome = ({ user }) => (
  <Message color="info">
    <Message.Header>
      Welcome, {user.displayName}
      <Button primary onClick={() => firebase.auth().signOut()} style={{color:'white', float:'right', marginRight: '3%'}}>
        Log out
      </Button>
    </Message.Header>
  </Message>
);

const SignIn = () => (
  <StyledFirebaseAuth
    uiConfig={uiConfig}
    firebaseAuth={firebase.auth()}
  />
);

const Banner = ({ user }) => (
  <React.Fragment>
    { user ? <Welcome user={ user } /> : <SignIn /> }
  </React.Fragment>
);

function roundToTwo(num) {    
  return +(Math.round(num + "e+2")  + "e-2");
}


class CartListItem extends React.Component {

  removeFromCart = (setCartItems, cartItems, product, cartQuantities, setCartQuantities) => {
    cartQuantities.set(product.title, cartQuantities.get(product.title) - 1);
    if (cartQuantities.get(product.title) <= 0) {
      cartQuantities.delete(product.title)
      cartItems = cartItems.filter(function(p) { return p.title != product.title; }); 
    }
    setCartItems(cartItems);
    setCartQuantities(cartQuantities); 
    this.forceUpdate()
  };


  render() {
    const product = this.props.product;
    const cartItems = this.props.cartItems;
    const setCartItems = this.props.setCartItems; 
    const cartQuantities = this.props.cartQuantities;
    const setCartQuantities = this.props.setCartQuantities; 
    return (
      <ListItem button style={{width: '100%', height: '100%'}}>
          <img style={{maxHeight: '20%', maxWidth: '20%'}} src={`./data/products/${product.sku}_1.jpg`} alt=''/>
          <p style={{width: '70%', margin: '2%'}}>{product.title} <br></br> {"$" + product.price + ' x ' + cartQuantities.get(product.title)}</p>
          <IconButton onClick = {() => this.removeFromCart(setCartItems, cartItems, product, cartQuantities, setCartQuantities)} edge="end" aria-label="delete" style={{float: 'right', padding:'5%'}}>
            <DeleteIcon style={{color: 'white'}}/>
          </IconButton>
        </ListItem>
    );
  };
}

class Cart extends React.Component {

  checkout = (cartItems, cartQuantities, user, setCartItems, setCartQuantities, inventory, setInventory) => {
    alert(this.subtotal(cartItems, cartQuantities)); 
    cartItems.forEach(item => {
      console.log(item.sku);
      inventory[item.sku][item.size] = (inventory[item.sku][item.size] - cartQuantities.get(item.title))})
    setInventory(inventory);
    dbInventory.set(inventory)
    cartItems = [];
    cartQuantities = new Map();
    setCartItems(cartItems); 
    setCartQuantities(cartQuantities); 
    setFirebaseCart(user.uid,cartItems, cartQuantities); 
    alert("Checkout complete! Thanks for your purchase"); 

  }

  subtotal = (cartItems, cartQuantities) => {
    return new String("Subtotal: $" + roundToTwo(cartItems.reduce((a, b) => a + (cartQuantities.get(b.title) * b.price), 0)));
  }

  render() {
    const user = this.props.user; 
    const cartItems = this.props.cartItems;
    const setCartItems = this.props.setCartItems; 
    const cartQuantities = this.props.cartQuantities;
    const setCartQuantities = this.props.setCartQuantities; 
    const inventory = this.props.inventory;
    const setInventory = this.props.setInventory; 
    return (
      <div style={{padding: '1%', width: '30%', height: '100%', marginLeft: '70%', float: 'right', color: 'white', backgroundColor: "#161616", outlineColor: "black"}} >
        <div style={{width: '100%', height: '10%', textAlign:'center'}}><h2>Cart</h2></div>
        <List style={{maxHeight: '70%', overflow: 'auto'}} component="nav">
          {cartItems.map(product => <CartListItem product={product} cartQuantities = {cartQuantities} setCartQuantities = {setCartQuantities} cartItems = {cartItems} setCartItems = {setCartItems}></CartListItem>)}
        </List>
        <div style={{width: '100%', height: '10%', textAlign:'center'}}><h2>{this.subtotal(cartItems, cartQuantities)}</h2></div>
        <div style={{margin: '5%'}}><Button  onClick = {() => this.forceUpdate()} variant="contained" size="medium" color="#202020" style = {{margin: '0 auto', display: 'block'}}>
          Update Subtotal
        </Button></div>
        <div><Button onClick = {() => this.checkout(cartItems, cartQuantities, user, setCartItems, setCartQuantities, inventory, setInventory)} variant="contained" size="medium" color="#202020" style = {{margin: '0 auto', display: 'block'}}>
          Checkout
        </Button></div>
      </div>
    );
  }

}

class CartLogo extends React.Component {
  render() {
    const clickHandler = this.props.clickHandler; 
    return(
      <Fab onClick = {clickHandler} color="black" style={{margin: '2%', padding: '1%', float: 'right'}}>
        <ShoppingCartIcon />
      </Fab>
    );
  }
};

class SizeFilter extends React.Component {

  toggleCheckbox = (label, selectedCheckboxes, setSelectedCheckboxes, updateFlag, setUpdateFlag) => {
    if (selectedCheckboxes.has(label)) 
      selectedCheckboxes.delete(label);
    else 
      selectedCheckboxes.add(label);
    setSelectedCheckboxes(selectedCheckboxes);
    setUpdateFlag(!updateFlag);

  }

   makeCheckbox = (label, selectedCheckboxes, setSelectedCheckboxes,updateFlag, setUpdateFlag) => (
      <FormControlLabel
      control={
        <Checkbox onChange={() => this.toggleCheckbox(label, selectedCheckboxes, setSelectedCheckboxes, updateFlag, setUpdateFlag)} value={label} />
      }
      label={label}
    />
    );

  makeCheckboxes = (selectedCheckboxes, setSelectedCheckboxes, updateFlag, setUpdateFlag, ) => availableSizes.map(label => this.makeCheckbox(label, selectedCheckboxes, setSelectedCheckboxes, updateFlag, setUpdateFlag));



    render() {

      const selectedCheckboxes = this.props.selectedCheckboxes;
      const setSelectedCheckboxes = this.props.setSelectedCheckboxes;
      const updateFlag = this.props.updateFlag;
      const setUpdateFlag = this.props.setUpdateFlag;

      return(
        <div style={{marginRight: '3%', marginLeft: '5%', float: 'left'}}>
        <FormControl>
          <FormLabel >Sizes</FormLabel>
          <FormGroup>
            {this.makeCheckboxes(selectedCheckboxes, setSelectedCheckboxes, updateFlag, setUpdateFlag)}
          </FormGroup>
        </FormControl>
        </div>
        )
      };
}

class ProductGrid extends React.Component {

  sizeNotSoldOut = (product, size, inventory) => {
    if (inventory[product.sku] != null) {
      return inventory[product.sku][size] > 0;
    }
    return false;
  };

  someSizeNotSoldOut = (product, selectedCheckboxes, inventory) => {
    return Array.from(selectedCheckboxes).some(size => this.sizeNotSoldOut(product, size, inventory));
  };

  filterProducts = (products, selectedCheckboxes, inventory) => {
    if (Array.from(selectedCheckboxes).length == 0) {//if no size filter placed, show all products
      return products
  }
    else
      return products.filter(product => this.someSizeNotSoldOut(product, selectedCheckboxes, inventory));
  };

  render() {
    const user = this.props.user; 
    const products = this.props.products;
    const inventory = this.props.inventory;
    const cartItems = this.props.cartItems; 
    const setCartItems = this.props.setCartItems; 
    const cartQuantities = this.props.cartQuantities;
    const setCartQuantities = this.props.setCartQuantities; 
    const selectedCheckboxes = this.props.selectedCheckboxes;
    const setSelectedCheckboxes = this.props.setSelectedCheckboxes;

    var availableProducts = this.filterProducts(products, selectedCheckboxes, inventory);
    return (
      <Grid style={{width: '85%', marginTop: '0%'}} container spacing={10} justify="center"  >
        {availableProducts.map(product => <Product selectedCheckboxes = {selectedCheckboxes} user = {user} stock = {inventory[product.sku]} selectedCheckboxes = {selectedCheckboxes} cartQuantities = {cartQuantities} setCartQuantities = {setCartQuantities} cartItems = {cartItems} setCartItems = {setCartItems} product={product}>{product.title}</Product>)}
      </Grid>
    );
  };
};



class Product extends React.Component {

  getSizeFromInventory = (selectedCheckboxes, sku, quantity, stock) => {
    var validSize = -1;
    if (selectedCheckboxes.size == 0){
      alert("Please select allowable sizes")
      return validSize;
    }
    availableSizes.forEach(size => {
      console.log(stock[size], quantity)
      if (selectedCheckboxes.has(size) && stock[size] >= quantity)
        validSize =  size;
    });
    if (validSize == -1) {
      alert("Not enough stock in inventory to add to cart");
    }
    return validSize; 
  }

  addToCart = (setCartItems, cartItems, product, cartQuantities, setCartQuantities, user, selectedCheckboxes, stock) => {
    //TODO make sure there is enough inventory
    if (cartQuantities.has(product.title)) { //already in cart, just adding to quantity 
      cartQuantities.set(product.title, cartQuantities.get(product.title) + 1);
      cartItems = cartItems.filter(function(p) { return p.title != product.title; }); //remove item and re-add it with correct count field
    }
    else {
      cartQuantities.set(product.title, 1);
    }
    product['count'] = cartQuantities.get(product.title); 
    var size =  this.getSizeFromInventory(selectedCheckboxes, product.sku, product.count, stock); 
    if (size == -1) {
      cartQuantities.set(product.title, cartQuantities.get(product.title) - 1);
      cartItems = cartItems.filter(function(p) { return p.title != product.title; }); //remove item and re-add it with correct count field
      setCartItems(cartItems);
      setCartQuantities(cartQuantities); 
      return;
    }
    product['size'] = size;
    cartItems.push(product);
    setCartItems(cartItems);
    setCartQuantities(cartQuantities); 
    setFirebaseCart(user.uid, cartItems, cartQuantities); 
  }

  render() {
    const user = this.props.user; 
    const stock = this.props.stock; 
    const product = this.props.product;
    const cartItems = this.props.cartItems; 
    const setCartItems = this.props.setCartItems; 
    const cartQuantities = this.props.cartQuantities;
    const setCartQuantities = this.props.setCartQuantities; 
    const selectedCheckboxes = this.props.selectedCheckboxes; 
    return (
      <Card style={{textAlign: 'center', width: '25%', margin: '0.5%'}}>
      <img src={`./data/products/${product.sku}_2.jpg`} alt=''/>
      <div>{product.title}</div>
      <div>${product.price}</div>    
      <Button onClick = {() => this.addToCart(setCartItems, cartItems, product, cartQuantities, setCartQuantities, user, selectedCheckboxes, stock)} variant="contained" size="medium" color="#161616" style = {{margin: '3%'}}>
          Add to Cart
      </Button>
    </Card>
    )
  }

}

var setFirebaseCart = (uid, cartItems, cartQuantities) => {
  //TODO make sure cart is valid against inventory
  var cartItemsWithCount = []
  cartItems.forEach(function(item) {
    if (! item.hasOwnProperty('count')) {
      item['count'] = cartQuantities.get(item.title)
    }
    cartItemsWithCount.push(item)      
  });
  var obj = {};
  obj[uid] = cartItemsWithCount;
  db.child('carts').set(obj); 
};



const App = () => {

  const [data, setData] = useState({});
  const [isCartOpen, setIsCartOpen] = useState('cartOpen');
  const [cartItems, setCartItems] = useState([]); 
  const [cartQuantities, setCartQuantities] = useState(new Map()); 
  const [inventory, setInventory] = useState({});
  const [selectedCheckboxes, setSelectedCheckboxes] = useState(new Set());
  const [updateFlag, setUpdateFlag] = useState(false);
  const [cartPulledFlag, setCartPulledFlag] = useState(false);
  const [user, setUser] = useState(null);
  const products = Object.values(data);

  useEffect(() => {
    setIsCartOpen(false);
    const fetchProducts = async () => {
      const response = await fetch('./data/products.json');
      const json = await response.json();
      setData(json);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleData = snap => {
      if (snap.val()) {setInventory(snap.val())};
    }
    dbInventory.on('value', handleData, error => alert(error));
    return () => { dbInventory.off('value', handleData); };
  }, []);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(setUser);

  }, []);


  const handleCartOpen = () => {
    setIsCartOpen(true);
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
  };

  if(user && !cartPulledFlag && cartItems && cartItems.length == 0) { //pull from database
    if (cartItems == null) {
      setCartItems([]);
    }
    var ref = db.child('carts');
    try {
      ref = ref.child(user.uid); 
    }
    catch {
      setCartPulledFlag(true); //user has never populated a cart
      return;
    }
    // Attach an asynchronous callback to read the data at our posts reference
    ref.on("value", function(snapshot) {
      var val = snapshot.val();
      if (val == null) {
        setCartPulledFlag(true); //user has never populated a cart
        return;
      }
      val.forEach(function(prod){ //update quantities for cart items from db
        cartQuantities.set(prod.title, prod.count); 
        setCartQuantities(cartQuantities); 
      });
      setCartItems(val);
      setCartPulledFlag(true); 
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

  }


  if(user && (cartPulledFlag || (cartItems && cartItems.length > 0))){ //they have items in their cart locally, so update firebase instance of cart
    setFirebaseCart(user.uid, cartItems, cartQuantities);
  }

  return (
    <div>
      <div style = {{backgroundColor: '#202020', color: "white", padding: "2%", width: '100%'}}>
        <Banner user={ user } />
      </div>
    <div style={{width: '100%'}}><CartLogo clickHandler = {handleCartOpen}></CartLogo></div>
    <Modal open={isCartOpen} onClose={handleCartClose}>
      {<Cart inventory = {inventory} setInventory = {setInventory} user = {user} cartItems = {cartItems} setCartItems = {setCartItems} cartQuantities = {cartQuantities} setCartQuantities = {setCartQuantities}></Cart>}
    </Modal>
    <Grid style={{marginTop: '10%'}} container updateFlag = {updateFlag} setUpdateFlag = {setUpdateFlag}> 
      <SizeFilter updateFlag = {updateFlag} setUpdateFlag = {setUpdateFlag} selectedCheckboxes = {selectedCheckboxes} setSelectedCheckboxes = {setSelectedCheckboxes}/>
      <ProductGrid  user = {user} selectedCheckboxes = {selectedCheckboxes} setSelectedCheckboxes = {setSelectedCheckboxes} products = {products} inventory = {inventory} cartItems = {cartItems} setCartItems = {setCartItems} cartQuantities = {cartQuantities} setCartQuantities = {setCartQuantities}></ProductGrid>
    </Grid>
    </div>
  );
};

export default App;