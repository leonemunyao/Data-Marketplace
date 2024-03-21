import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, Button, Col, Badge, Stack, Row} from "react-bootstrap";
import { toast } from "react-toastify";
import { NotificationError, NotificationSuccess } from "../utils/Notifications";
import UpdateItem from "./UpdateItem";
import DeleteItem from "./DeleteItem";
import { addPurchasedItem, createPurchaser, deleteDataItem } from "../../utils/dataMarketplace";
import BuyItem from "./BuyItem";

const Item = ({ item, buyItem }) => {
  const { id, title, description,price, seller, attachmentURL, dataFormat, status, quality, rating } =
    item;

  const [sold, setSold] = useState(false);
  

  const discardItem =  () => {
    try {
      deleteDataItem(id);
      toast(<NotificationSuccess text="Data Item removed successfully." />);
    } catch (error) {
      console.log({error});
      toast(<NotificationError text="Failed to Remove a Data Item." />);
    }
  }

    // Afer Purchase set its Status as Sold 
  const triggerBuy =  () => {
    buyItem(id);
  }


  return (
    <Col md={4} className="mb-3">
      <Card>
        <Card.Img variant="top" src={attachmentURL} style={{height:"180px"}} />
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Badge bg="dark" text="light" className="mx-1">
              {id}
          </Badge>
          <Card.Text>{description}</Card.Text>
          <Stack direction="horizontal" gap={3}>
            <p>Price: </p>
            <Badge bg="primary"> {price.toString()} ICP</Badge>
            <p>Seller: </p>
            <Badge bg="secondary">{seller}</Badge>
          </Stack>
          <Stack direction="horizontal" gap={3}>
            <p>Data Format: </p>
            <Badge bg="success">{dataFormat}</Badge>
            <p>Status: </p>
            <Badge bg="warning">{status}</Badge>
          </Stack>
          <Stack direction="horizontal" gap={3}>
            <p>Quality: </p>
            <Badge bg="info">{quality}</Badge>
            <p>Rating: </p>
            <Badge bg="dark">{rating.toString()} %</Badge>
          </Stack>
          <Row>
              <Col className="d-flex justify-content-center">
                  <Stack direction="horizontal" gap={3}>
                      <UpdateItem itemId={id} />

                      <Button
                          variant="success"
                          onClick={ () => {
                              triggerBuy().then(() => {
                                setSold(true);
                              } );
                          }}
                          disabled={sold}
                      >
                          Buy
                      </Button>
                      <DeleteItem discard={discardItem} />
                  </Stack>
              </Col>
            </Row>


        </Card.Body>
      </Card>
    </Col>
  );
};

Item.propTypes = {
  item: PropTypes.instanceOf(Object).isRequired,
};

export default Item;
