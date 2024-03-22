import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import Loader from "../utils/Loader";
import { Row, Button,InputGroup, Form } from "react-bootstrap";

import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import {
  buyDataItem,
  createItem,
  filterDataItems,
  getInitialDataItem,
  getItems as getItemList,
  getMoreDataItems,
  getPurchasers,
  searchDataItem,

} from "../../utils/dataMarketplace";
import AddItem from "./AddItem";
import Item from "./Item";
import Purchaser from "./Purchaser";

const Items = () => {
  const [dataItems, setDataItems] = useState([]);
  const [purchasers, setPurchasers] = useState([]);
  const [start, setStart] = useState(0);
  const [limit, setLimit] = useState(0);
  const [loading, setLoading] = useState(false);

  const [listType, setListType] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  // const [searchResults, setSearchResults] = useState([]);




  
  const getItems = useCallback(async () => {
    try {
      setLoading(true);
      setListType("items")
      setDataItems(await getItemList());
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  });

  const getAllPurchasers = async () => {
    try {
      setLoading(true);
      setListType("purchasers");
      setPurchasers(await getPurchasers());
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  };


  const addItem = async (data) => {
    try {
      setLoading(true);
      const priceStr = data.price;
      const ratingStr = data.rating;
      data.price = parseInt(priceStr); 
      data.rating = parseInt(ratingStr);
      createItem(data).then((resp) => {
        getItems();
      });
      toast(<NotificationSuccess text="Data Item added successfully." />);
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create a Data Item." />);
    } finally {
      setLoading(false);
    }
  };

  const getInitialItems = async () => {
    try {
      setLoading(true);
      setDataItems(await getInitialDataItem());
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  };
 
  const getMoreItems = async () => {
    try {
      setLoading(true);
      const startInt = parseInt(start);
      const limitInt = parseInt(limit);
      setDataItems(await getMoreDataItems(startInt, limitInt));
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  };

  const searchData = async (filter) => {
    try {
      setLoading(true);
      setDataItems(await searchDataItem(filter));
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  };


  const buy = async (id) => {
    try {
      setLoading(true);
      await buyDataItem({
        id
      }).then((resp) => {
        getItems();
        toast(<NotificationSuccess text="Data Item Purchased successfully" />);
      });
    } catch (error) {
      toast(<NotificationError text="Failed to Purchase Data Item." />);
    } finally {
      setLoading(false);
    }
  };





  // useEffect(() => {
  //   getItems();
  // }, []);

  return (
    <>
      {!loading ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="fs-4 fw-bold mb-0">Data Marketplace</h1>
            <AddItem save={addItem} />
          </div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button variant="dark" className="mx-2" onClick={() => getInitialItems()} style={{width:"470px"}}>
              Get Initial Items
            </Button>
            <InputGroup className="mb-3 mx-2">
              <Form.Control aria-label="Start" 
                placeholder="Start"
                onChange={(e) => setStart(e.target.value)}
              />
              <Form.Control aria-label="Limit" 
                placeholder="Limit"
                onChange={(e) => setLimit(e.target.value)}
              />
              <Button variant="success" id="button-addon2"
                onClick={() => getMoreItems()}
              >
                  Get Items By Interval
              </Button>
            </InputGroup>
            <InputGroup className="mb-3 mx-2 mx-2">
              <Form.Control
                placeholder="Search by title or description" 
                aria-label="Search"
                aria-describedby="basic-addon2"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="success" id="button-addon2"
                onClick={() => searchData(searchQuery)}
              >
                Search
              </Button>
            </InputGroup>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button variant="dark" className="mx-2" onClick={() => getItems()} style={{width:"470px"}}>
              Items
            </Button>
            <Button variant="dark" className="mx-2" onClick={() => getAllPurchasers()} style={{width:"470px"}}>
              Purchasers
            </Button>
          </div>

         
          <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5">
            {listType === "items" && dataItems.map((_dataItem, index) => (
              <Item
                key={index}
                item={{
                  ..._dataItem,
                }}
                buyItem={buy}
              />
            ))}

            {listType === "purchasers" && purchasers.map((_purchaser, index) => (
              <Purchaser
                key={index}
                purchaser={{
                  ..._purchaser,
                }}
              />
            ))
            }
          </Row>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Items;
