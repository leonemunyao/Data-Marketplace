import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import { toast } from "react-toastify";
import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import { getPurchaser, updatePurchaser } from '../../utils/dataMarketplace';

const UpdatePurchaser = ({purchaserId}) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [message, setMessage] = useState("");

    const isFormFilled = () => name && price && message ;

    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        const fetchPurchaser = async () => {
            try {
                const Purchaser = await getPurchaser(purchaserId);
                setName(Purchaser.name);
                setPrice(Purchaser.price);
                setMessage(Purchaser.message);
            } catch (error) {
                console.error(error);
            }
        };

        fetchPurchaser();
    }, [purchaserId]);

    const updateThePurchaser = async () => {
        try {
            const id = purchaserId;
            const priceInt = parseInt(price)
            await updatePurchaser(id, {name, price: priceInt, message});
            toast(<NotificationSuccess text="Purchaser updated successfully." />);
        } catch (error) {
            console.log({ error });
            toast(<NotificationError text="Failed to update a Purchaser." />);
        }
    }
  return (
    <>
      <Button
        onClick={handleShow}
        variant="dark"
        className="rounded-pill px-0"
        style={{ width: "38px" }}
      >
        <i className="bi bi-pencil"></i>
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Purchaser</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="name">
              <FloatingLabel controlId="name" label="Name">
                <Form.Control
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3" controlId="price">
              <FloatingLabel controlId="price" label="Price">
                <Form.Control
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3" controlId="message">
              <FloatingLabel controlId="message" label="Message">
                <Form.Control
                  type="text"
                  placeholder="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </FloatingLabel>
            </Form.Group>
            <Button
              variant="dark"
              type="button"
              disabled={!isFormFilled()}
              onClick={() => {
                updateThePurchaser();
                handleClose();
              }}
            >
              Update
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default UpdatePurchaser