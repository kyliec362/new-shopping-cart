import React, { useEffect, useState } from 'react';
import { Grid } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import { Checkbox } from '@material-ui/core';

const availableSizes = ['XS', 'S', 'M', 'ML', 'L', 'XL', 'XXL'];

class SizeFilter extends React.Component {

    componentDidMount() {
      this.selectedCheckboxes = new Set();
    };

    makeCheckbox = label => (
        <Checkbox
        label={label}
        handleCheckboxChange={this.toggleCheckbox}
        key={label}
      />
      );

    makeCheckboxes = () => Array.from(this.selectedCheckboxes).map(this.createCheckbox);

  
    toggleCheckbox = label => {
      if (this.selectedCheckboxes.has(label)) {
        this.selectedCheckboxes.delete(label);
      } else {
        this.selectedCheckboxes.add(label);
      }
    }

    render() {
      return(
        <div>
          {this.createCheckboxes()}
        </div>
        )
      };
}
class Product extends React.Component {
  render() {
    const product = this.props.product;
    return (
      <Card style={{textAlign: 'center', width: '25%', margin: '0.5%'}}>
      <img src={`./data/products/${product.sku}_2.jpg`} alt=''/>
      <div>{product.title}</div>
      <div>${product.price}</div>
    </Card>
    )
  }

}

const App = () => {
  const [data, setData] = useState({});
  const products = Object.values(data);
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('./data/productTitles.json');
      const json = await response.json();
      setData(json);
    };
    fetchProducts();
  }, []);

  return (
    <Grid container spacing={10} justify="center">
      {products.map(product => <Product product={product}>{product.title}</Product>)}
    </Grid>
  );
};

export default App;