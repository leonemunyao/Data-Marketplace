import React from "react";
import PropTypes from "prop-types";
import { Card, Button, Col, Badge, Stack } from "react-bootstrap";
import { toast } from "react-toastify";
import { NotificationError, NotificationSuccess } from "../utils/Notifications";
import UpdatePurchaser from "./UpdatePurchaser";
import DeletePurchaser from "./DeletePurchaser";
import UpdatePurchasedItem from "./UpdatePurchasedItem";
import { deletePurchaser } from "../../utils/dataMarketplace";


const Purchaser = ({purchaser}) => {
    const { id, name, price, message, purchasedItem} = purchaser

    const discardPurchaser =  () => {
      try {
        deletePurchaser(id);
        toast(<NotificationSuccess text="Purchaser removed successfully." />);
        window.location.reload()
      } catch (error) {
        console.log({error});
        toast(<NotificationError text="Failed to Remove a Purchaser" />);
      }
    }

  return (

    <Card>
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Text>
          <p>Price: {price.toString()}</p>
          <p>Message: {message}</p>
          <p>Purchased Item: 
              {purchasedItem.map((item, index) => (
                  <Badge key={index} bg="dark" text="light" className="mx-1">
                    {item}
                  </Badge>
                ))
              }
            </p>
        </Card.Text>
      </Card.Body>
      <Card.Footer>
        <Stack direction="horizontal" gap={2}>
          <UpdatePurchaser purchaserId={id} />
          <DeletePurchaser discard={discardPurchaser} />
          <UpdatePurchasedItem purchaserId={id} />

        </Stack>
      </Card.Footer>
    </Card>
    
  )
}

export default Purchaser