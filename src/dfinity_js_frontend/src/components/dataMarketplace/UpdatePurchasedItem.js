import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import { toast } from "react-toastify";
import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import { addPurchasedItem,  getPurchaser } from '../../utils/dataMarketplace';
const UpdatePurchasedItem = ({purchaserId}) => {
    const [purcahsedItemId, setPurcahsedItemId] = useState("");
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    const addPurchased = async () => {
        try {
            const id = purchaserId;
            await addPurchasedItem(id,purcahsedItemId);
            toast(<NotificationSuccess text="Purchased Item added successfully." />);
        } catch (error) {
            console.log({ error });
            toast(<NotificationError text="Failed to add a Purchased Item." />);
        }
    }

  return (
    <>
      <Button variant="dark" className="rounded-pill px-3" onClick={handleShow}>
        Update Purchased Item
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Purchased Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <FloatingLabel controlId="floatingInput" label="Purchased Item">
              <Form.Control
                type="text"
                placeholder="Purchased Item"
                value={purcahsedItemId}
                onChange={(e) => setPurcahsedItemId(e.target.value)}
              />
            </FloatingLabel>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="dark" onClick={() => {addPurchased(); handleClose()}}>
            Update Purchased Item
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default UpdatePurchasedItem