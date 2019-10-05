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
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';


const availableSizes = ['S', 'M', 'L', 'XL'];

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

    componentDidMount() {
      this.selectedCheckboxes = new Set();
    };

    makeCheckbox = label => (
      <FormControlLabel
      control={
        <Checkbox onChange={this.toggleCheckbox} value={label} />
      }
      label={label}
    />
    );

    makeCheckboxes = () => availableSizes.map(this.makeCheckbox);

    toggleCheckbox = label => {
      if (this.selectedCheckboxes.has(label)) {
        this.selectedCheckboxes.delete(label);
      } else {
        this.selectedCheckboxes.add(label);
      }
    }

    render() {
      return(
        <div style={{marginRight: '3%', marginLeft: '5%', float: 'left'}}>
        <FormControl>
          <FormLabel >Sizes</FormLabel>
          <FormGroup>
            {this.makeCheckboxes()}
          </FormGroup>
        </FormControl>
        </div>
        )
      };
}

class Product extends React.Component {

  addToCart = (setCartItems, cartItems, product, cartQuantities, setCartQuantities) => {
    console.log(cartQuantities)
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
  const products = Object.values(data);

  useEffect(() => {
    setIsCartOpen(false);
    const fetchProducts = async () => {
      const response = await fetch('./data/productTitles.json');
      const json = await response.json();
      setData(json);
    };
    fetchProducts();
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
    <Grid style={{marginTop: '10%'}} container>
      <SizeFilter/>
      <Grid style={{width: '85%', marginTop: '0%'}} container spacing={10} justify="center"  >
        {products.map(product => <Product cartQuantities = {cartQuantities} setCartQuantities = {setCartQuantities} cartItems = {cartItems} setCartItems = {setCartItems} product={product}>{product.title}</Product>)}
      </Grid>
    </Grid>
    </div>
  );
};

export default App;