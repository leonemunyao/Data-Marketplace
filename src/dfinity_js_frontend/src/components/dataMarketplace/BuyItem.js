import React, { useState } from "react";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
const BuyItem = ({buy, sellPrice}) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [message, setMessage] = useState("");

    const isFormFilled = () => name && price && message && sellPrice.toString() === price.toString();

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    return (
        <>
            <Button
                onClick={handleShow}
                variant="success"

            >
                Buy
            </Button>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Buy Item</Modal.Title>
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
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        disabled={!isFormFilled()}
                        onClick={() => {
                            buy({name, price, message});
                            handleClose();
                        }}
                    >
                        Buy
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
    
}

export default BuyItem