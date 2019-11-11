import React, { Component } from "react";
import Item from "../Item/Item";
import CircularProgress from "@material-ui/core/CircularProgress";
import queryString from "query-string";
import Api from "../../Api";
import Paging from "../Paging/Paging";
import ProductsHeader from "../ProductsHeader/ProductsHeader"

// This component is responsible for searching products.
// It performs the search based on parameters in the query string
// (because of this much state of this component actually lives in the URL).
// The URL is checked on first mount and when URL changes.
// We use query strings so that user could share a link to his/her search results for example.
class ProductList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      totalItemsCount: null,
      items: []
    };

    this.updateQueryString = this.updateQueryString.bind(this);
  }


  updateQueryString(newValues) {
    let currentQs = queryString.parse(this.props.location.search);
    let newQS = { ...currentQs, ...newValues };
    this.props.history.push("/?" + queryString.stringify(newQS));
  }

  async fetchData() {

    this.setState({ loading: true });

    let qsAsObject = queryString.parse(this.props.location.search);
    let results = await Api.searchItems({ ...qsAsObject, usePriceFilter: qsAsObject.usePriceFilter === "true" });

    this.setState({
      items: results.data,
      loading: false,
      totalItemsCount: results.totalLength
    });
  }

  componentDidMount() {
    this.fetchData();
  }


  componentDidUpdate(prevProps, prevState, snapshot) {

    let currentQS = queryString.parse(this.props.location.search);
    let oldQS = queryString.parse(prevProps.location.search)

    // Check if the query strings changed.
    let check1 = Object.entries(currentQS).some(([k, v]) => v !== oldQS[k]);
    let check2 = Object.entries(oldQS).some(([k, v]) => v !== currentQS[k]);
    let isDifferent = check1 || check2;

    // We will refetch products only when query string changes.
    if (isDifferent) {
      this.fetchData();
    }
  }



  getPageTitle() {
    let pageTitle = "Search results";
    let category = queryString.parse(this.props.location.search).category;
    let directClick = queryString.parse(this.props.location.search).directClick === "true";

    if (!category) {
      pageTitle = "Popular products";
    } else if (directClick) {
      pageTitle = category;
    }
    return pageTitle;
  }

  render() {
    let qs = queryString.parse(this.props.location.search);
    let itemsPerPage = qs.itemsPerPage || 10;
    let page = qs.page || 1;

    if (this.state.loading) {
      return (
        <CircularProgress className="circular" />
      );
    }

    return (
      <div
      >
        {/* Product list header */}
        <ProductsHeader
          loading={this.state.loading}
          pageTitle={this.getPageTitle()}
          updateQueryString={this.updateQueryString}
          queryString={qs}
          totalItemsCount={this.state.totalItemsCount} />

        {/* Here go the items */}
        {
          this.state.items.map(item => {
            return <Item key={item.id} item={item} />;
          })
        }
        {/* Paging component */}
        {
          !this.state.loading && !!this.state.totalItemsCount && (
            <Paging
              itemsPerPage={itemsPerPage}
              page={page}
              updateQueryString={this.updateQueryString}
              totalItemsCount={this.state.totalItemsCount}
            />
          )
        }

      </div >
    );
  }
}

export default ProductList;
