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
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
//import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';


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

  checkout = (cartItems, cartQuantities) => {
    alert(this.subtotal(cartItems, cartQuantities)); 
  }

  subtotal = (cartItems, cartQuantities) => {
    return new String("Subtotal: $" + roundToTwo(cartItems.reduce((a, b) => a + (cartQuantities.get(b.title) * b.price), 0)));
  }

  render() {
    const cartItems = this.props.cartItems;
    const setCartItems = this.props.setCartItems; 
    const cartQuantities = this.props.cartQuantities;
    const setCartQuantities = this.props.setCartQuantities; 
    return (
      <div style={{padding: '1%', width: '30%', height: '100%', marginLeft: '70%', float: 'right', color: 'white', backgroundColor: "#161616", outlineColor: "black"}} >
        <div style={{width: '100%', height: '10%', textAlign:'center'}}><h2>Cart</h2></div>
        <List style={{maxHeight: '70%', overflow: 'auto'}} component="nav">
          {cartItems.map(product => <CartListItem product={product} cartQuantities = {cartQuantities} setCartQuantities = {setCartQuantities} cartItems = {cartItems} setCartItems = {setCartItems}></CartListItem>)}
        </List>
        <div style={{width: '100%', height: '10%', textAlign:'center'}}><h2>{this.subtotal(cartItems, cartQuantities)}</h2></div>
        <div><Button onClick = {() => this.checkout(cartItems, cartQuantities)} variant="contained" size="medium" color="#202020" style = {{margin: '0 auto', display: 'block'}}>
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
    console.log(109, selectedCheckboxes);
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
        {availableProducts.map(product => <Product stock = {inventory[product.sku]} selectedCheckboxes = {selectedCheckboxes} cartQuantities = {cartQuantities} setCartQuantities = {setCartQuantities} cartItems = {cartItems} setCartItems = {setCartItems} product={product}>{product.title}</Product>)}
      </Grid>
    );
  };
};



class Product extends React.Component {

  addToCart = (setCartItems, cartItems, product, cartQuantities, setCartQuantities) => {
    if (cartQuantities.has(product.title)) { //already in cart, just adding to quantity 
      cartQuantities.set(product.title, cartQuantities.get(product.title) + 1);
      setCartQuantities(cartQuantities); 
    }
    else {
      cartItems.push(product);
      cartQuantities.set(product.title, 1);
      setCartQuantities(cartQuantities); 
      setCartItems(cartItems);
    }

  }

  render() {
    const product = this.props.product;
    const cartItems = this.props.cartItems; 
    const setCartItems = this.props.setCartItems; 
    const cartQuantities = this.props.cartQuantities;
    const setCartQuantities = this.props.setCartQuantities; 
    return (
      <Card style={{textAlign: 'center', width: '25%', margin: '0.5%'}}>
      <img src={`./data/products/${product.sku}_2.jpg`} alt=''/>
      <div>{product.title}</div>
      <div>${product.price}</div>
      <Button onClick = {() => this.addToCart(setCartItems, cartItems, product, cartQuantities, setCartQuantities)} variant="contained" size="medium" color="#161616" style = {{margin: '3%'}}>
          Add to Cart
      </Button>
    </Card>
    )
  }

}

const App = () => {

  const [data, setData] = useState({});
  const [isCartOpen, setIsCartOpen] = useState('cartOpen');
  const [cartItems, setCartItems] = useState([]); 
  const [cartQuantities, setCartQuantities] = useState(new Map()); 
  const [inventory, setInventory] = useState({});
  const [selectedCheckboxes, setSelectedCheckboxes] = useState(new Set());
  const [updateFlag, setUpdateFlag] = useState(false);
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
    db.on('value', handleData, error => alert(error));
    return () => { db.off('value', handleData); };
  }, []);

  const handleCartOpen = () => {
    setIsCartOpen(true);
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
  };

  return (
    <div>
    <div style={{width: '100%'}}><CartLogo clickHandler = {handleCartOpen}></CartLogo></div>
    <Modal open={isCartOpen} onClose={handleCartClose}>
      {<Cart cartItems = {cartItems} setCartItems = {setCartItems} cartQuantities = {cartQuantities} setCartQuantities = {setCartQuantities}></Cart>}
    </Modal>
    <Grid style={{marginTop: '10%'}} container updateFlag = {updateFlag} setUpdateFlag = {setUpdateFlag}> 
      <SizeFilter updateFlag = {updateFlag} setUpdateFlag = {setUpdateFlag} selectedCheckboxes = {selectedCheckboxes} setSelectedCheckboxes = {setSelectedCheckboxes}/>
      <ProductGrid selectedCheckboxes = {selectedCheckboxes} setSelectedCheckboxes = {setSelectedCheckboxes} products = {products} inventory = {inventory} cartItems = {cartItems} setCartItems = {setCartItems} cartQuantities = {cartQuantities} setCartQuantities = {setCartQuantities}></ProductGrid>
    </Grid>
    </div>
  );
};

export default App;